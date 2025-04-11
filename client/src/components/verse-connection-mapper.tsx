import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Network } from 'lucide-react';
import * as d3 from 'd3';
import { SimulationNodeDatum, SimulationLinkDatum, Simulation } from 'd3-force';
import { Thirukkural } from '@shared/schema';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  val: number;
  color: string;
  chapter: number;
  kuralNumber: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  index?: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
  color?: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export default function VerseConnectionMapper() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [showBirdsEyeView, setShowBirdsEyeView] = useState(false);
  
  const { selectedKural, selectKural, searchResults } = useStore();
  
  // Helper function to generate node color based on chapter number
  const getNodeColor = (chapterNumber: number): string => {
    // Map chapter number to a color using a gradient
    const section = Math.floor(chapterNumber / 44); // 133 chapters divided into 3 sections
    
    if (section === 0) {
      // Virtue (Aram) - blue gradient
      return `rgb(64, ${120 + (chapterNumber % 44) * 3}, 255)`;
    } else if (section === 1) {
      // Wealth (Porul) - green gradient
      return `rgb(0, ${180 + (chapterNumber % 44) * 1.5}, ${100 + (chapterNumber % 44) * 3})`;
    } else {
      // Love (Inbam) - purple/pink gradient
      return `rgb(${180 + (chapterNumber % 44) * 1.5}, 50, ${200 + (chapterNumber % 44) * 1.2})`;
    }
  };
  
  // Generate graph data from selected kural and search results
  useEffect(() => {
    if (!selectedKural) return;
    
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeIds = new Set<string>();
    
    // Add selected kural as central node
    const centralNodeId = `kural-${selectedKural.number}`;
    nodes.push({
      id: centralNodeId,
      name: `${selectedKural.number}: ${selectedKural.english.substring(0, 40)}...`,
      val: 20, // larger node
      color: getNodeColor(selectedKural.chapter),
      chapter: selectedKural.chapter,
      kuralNumber: selectedKural.number
    });
    nodeIds.add(centralNodeId);
    
    // Add nodes for kurals from the same chapter
    const chapterKurals = searchResults
      .filter(result => result.thirukkural.chapter === selectedKural.chapter && result.thirukkural.number !== selectedKural.number)
      .map(result => result.thirukkural);
      
    // If we don't have enough results, add some with sequential numbers
    const additionalNodesNeeded = Math.max(0, 5 - chapterKurals.length);
    const sequentialKurals: Thirukkural[] = [];
    
    for (let i = 1; i <= additionalNodesNeeded; i++) {
      const num = selectedKural.number + i;
      if (num <= 1330 && num !== selectedKural.number) {
        sequentialKurals.push({
          id: num,
          number: num,
          chapter: selectedKural.chapter,
          chapterName: selectedKural.chapterName,
          sectionName: selectedKural.sectionName,
          tamil: "",
          english: `Verse ${num}`,
          tamilExplanation: "",
          englishExplanation: "",
          vector: null
        });
      }
    }
    
    // Add related kurals from same chapter
    [...chapterKurals, ...sequentialKurals].forEach(kural => {
      const nodeId = `kural-${kural.number}`;
      if (!nodeIds.has(nodeId)) {
        nodes.push({
          id: nodeId,
          name: `${kural.number}: ${kural.english.substring(0, 30)}...`,
          val: 10,
          color: getNodeColor(kural.chapter),
          chapter: kural.chapter,
          kuralNumber: kural.number
        });
        nodeIds.add(nodeId);
        
        // Link to central node
        links.push({
          source: centralNodeId,
          target: nodeId,
          value: 3,
          color: 'rgba(255, 255, 255, 0.2)'
        });
      }
    });
    
    // Add other search results as related nodes
    searchResults
      .filter(result => result.thirukkural.chapter !== selectedKural.chapter)
      .forEach(result => {
        const kural = result.thirukkural;
        const nodeId = `kural-${kural.number}`;
        if (!nodeIds.has(nodeId)) {
          nodes.push({
            id: nodeId,
            name: `${kural.number}: ${kural.english.substring(0, 30)}...`,
            val: 8,
            color: getNodeColor(kural.chapter),
            chapter: kural.chapter,
            kuralNumber: kural.number
          });
          nodeIds.add(nodeId);
          
          // Link to central node with strength based on relevance
          links.push({
            source: centralNodeId,
            target: nodeId,
            value: 1 + result.relevance * 5,
            color: 'rgba(255, 255, 255, 0.1)'
          });
        }
      });
    
    // Add connections between nodes in the same chapter
    nodes
      .filter(node => node.chapter === selectedKural.chapter && node.id !== centralNodeId)
      .forEach((node, idx, arr) => {
        if (idx < arr.length - 1) {
          links.push({
            source: node.id,
            target: arr[idx + 1].id,
            value: 1,
            color: 'rgba(255, 255, 255, 0.05)'
          });
        }
      });
    
    setGraphData({ nodes, links });
  }, [selectedKural, searchResults]);

  // Setup resize observer for the container
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    // Initial dimensions
    updateDimensions();
    
    // Setup resize observer
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);
  
  // Handle node click
  const handleNodeClick = useCallback((node: GraphNode) => {
    if (!node) return;
    
    // Select the kural for this node
    const kural = {
      id: parseInt(node.id.replace('kural-', '')),
      number: node.kuralNumber,
      chapter: node.chapter,
      // Other fields will be filled by the getThirukkuralByNumber API
      chapterName: '',
      sectionName: '',
      tamil: '',
      english: '',
      tamilExplanation: '',
      englishExplanation: '',
      vector: null
    };
    
    selectKural(kural);
    setSelectedNode(node);
  }, [selectKural]);
  
  // Handle node hover
  const handleNodeHover = useCallback((node: GraphNode | null) => {
    if (!graphRef.current || !node) {
      setHighlightLinks(new Set());
      setHighlightNodes(new Set());
      return;
    }
    
    // Get connected links and nodes
    const connectedLinks = graphData.links
      .filter(link => {
        const sourceId = typeof link.source === 'object' ? link.source?.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target?.id : link.target;
        return sourceId === node.id || targetId === node.id;
      })
      .map(link => {
        const sourceId = typeof link.source === 'object' ? link.source?.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target?.id : link.target;
        return `${sourceId}-${targetId}`;
      });
      
    const connectedNodes = new Set([node.id]);
    graphData.links
      .filter(link => {
        const sourceId = typeof link.source === 'object' ? link.source?.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target?.id : link.target;
        return sourceId === node.id || targetId === node.id;
      })
      .forEach(link => {
        if (typeof link.source === 'object' && link.source?.id) {
          connectedNodes.add(link.source.id);
        } else if (typeof link.source === 'string') {
          connectedNodes.add(link.source);
        }
        
        if (typeof link.target === 'object' && link.target?.id) {
          connectedNodes.add(link.target.id);
        } else if (typeof link.target === 'string') {
          connectedNodes.add(link.target);
        }
      });
    
    setHighlightLinks(new Set(connectedLinks));
    setHighlightNodes(connectedNodes);
  }, [graphData]);
  
  // Link style function
  const getLinkColor = useCallback((link: any) => {
    const sourceId = typeof link.source === 'object' ? link.source?.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target?.id : link.target;
    const linkId = `${sourceId}-${targetId}`;
    
    return highlightLinks.has(linkId) 
      ? 'rgba(255, 255, 255, 0.8)' 
      : link.color || 'rgba(255, 255, 255, 0.1)';
  }, [highlightLinks]);
  
  // Node style function
  const getNodeColor2 = useCallback((node: GraphNode) => {
    if (!node || !node.id) return 'rgba(200, 200, 200, 0.5)';
    
    return highlightNodes.has(node.id)
      ? node.color // Full brightness for highlighted nodes
      : (graphData.nodes.length > 20 && !highlightNodes.size)
          ? `${node.color.slice(0, -1)}, 0.3)` // Dimmed color if many nodes and nothing highlighted
          : `${node.color.slice(0, -1)}, 0.7)`; // Slightly dimmed color otherwise
  }, [highlightNodes, graphData.nodes.length]);

  // Initialize and update D3 force simulation
  useEffect(() => {
    if (!containerRef.current || graphData.nodes.length === 0) return;

    const svg = d3.select(containerRef.current).select('svg');
    const width = dimensions.width;
    const height = dimensions.height;
    
    // Clear previous graph
    svg.selectAll("*").remove();
    
    // Create a D3 force simulation
    const simulation = d3.forceSimulation<GraphNode>(graphData.nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(graphData.links)
        .id(d => d.id)
        .distance(d => 100 / (d.value || 1))
        .strength(d => 0.1 + d.value * 0.03))
      .force("charge", d3.forceManyBody()
        .strength(d => -100 * (d.val || 1)))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide()
        .radius(d => 10 + (d.val || 1)))
      .alphaDecay(0.02)
      .velocityDecay(0.3);
    
    // Create a container for the zoom functionality
    const container = svg.append("g")
      .attr("class", "container");
    
    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });
    
    svg.call(zoom as any);
    
    // Draw links
    const link = container.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graphData.links)
      .enter()
      .append("line")
      .attr("stroke", getLinkColor)
      .attr("stroke-width", d => Math.max(1, d.value / 2))
      .attr("stroke-opacity", 0.7);
    
    // Add link particles for animated flow
    const linkParticles = container.append("g")
      .attr("class", "particles")
      .selectAll("circle")
      .data(graphData.links.filter(link => {
        const sourceId = typeof link.source === 'object' ? link.source?.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target?.id : link.target;
        return highlightLinks.has(`${sourceId}-${targetId}`);
      }))
      .enter()
      .append("circle")
      .attr("r", 2)
      .attr("fill", "#fff");
    
    // Draw nodes
    const node = container.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graphData.nodes)
      .enter()
      .append("circle")
      .attr("r", d => 5 + Math.sqrt(d.val))
      .attr("fill", getNodeColor2)
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .attr("stroke-opacity", 0.3)
      .on("click", (event, d) => handleNodeClick(d))
      .on("mouseover", (event, d) => handleNodeHover(d))
      .on("mouseout", () => handleNodeHover(null))
      .call(d3.drag<SVGCircleElement, GraphNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any);
    
    // Add labels to nodes
    const labels = container.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(graphData.nodes)
      .enter()
      .append("text")
      .attr("dx", 10)
      .attr("dy", ".35em")
      .attr("font-size", "10px")
      .attr("fill", "rgba(255, 255, 255, 0.7)")
      .text(d => `Verse ${d.kuralNumber}`)
      .style("pointer-events", "none")
      .style("opacity", 0) // Hide by default
      .style("text-shadow", "0 1px 2px rgba(0,0,0,0.9)");
    
    // Show label on hover
    node.on("mouseover", function(event, d) {
      handleNodeHover(d);
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", d => 6 + Math.sqrt(d.val));
      
      labels
        .filter(label => label.id === d.id)
        .transition()
        .duration(200)
        .style("opacity", 1);
    })
    .on("mouseout", function() {
      handleNodeHover(null);
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", d => 5 + Math.sqrt(d.val));
        
      labels
        .transition()
        .duration(200)
        .style("opacity", 0);
    });
    
    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => (typeof d.source === 'object' && d.source) ? d.source.x || 0 : 0)
        .attr("y1", d => (typeof d.source === 'object' && d.source) ? d.source.y || 0 : 0)
        .attr("x2", d => (typeof d.target === 'object' && d.target) ? d.target.x || 0 : 0)
        .attr("y2", d => (typeof d.target === 'object' && d.target) ? d.target.y || 0 : 0);
      
      // Animate particles along links
      linkParticles
        .each(function(d) {
          const sourceX = typeof d.source === 'object' && d.source ? d.source.x || 0 : 0;
          const sourceY = typeof d.source === 'object' && d.source ? d.source.y || 0 : 0;
          const targetX = typeof d.target === 'object' && d.target ? d.target.x || 0 : 0;
          const targetY = typeof d.target === 'object' && d.target ? d.target.y || 0 : 0;
          
          // Calculate position along the line
          const t = (Date.now() % 3000) / 3000; // 3-second cycle
          const x = sourceX + (targetX - sourceX) * t;
          const y = sourceY + (targetY - sourceY) * t;
          
          d3.select(this)
            .attr("cx", x)
            .attr("cy", y);
        });
      
      node
        .attr("cx", d => d.x || 0)
        .attr("cy", d => d.y || 0);
      
      labels
        .attr("x", d => d.x || 0)
        .attr("y", d => d.y || 0);
    });
    
    // Store simulation reference
    graphRef.current = simulation;
    
    // Center and scale the graph to fit in the container
    setTimeout(() => {
      const zoomBehavior = zoom as any;
      zoomBehavior.translateTo(svg, width / 2, height / 2);
      zoomBehavior.scaleTo(svg, 0.8);
    }, 100);
    
    // Cleanup on unmount
    return () => {
      simulation.stop();
    };
  }, [graphData, dimensions, getLinkColor, getNodeColor2, handleNodeClick, handleNodeHover, highlightLinks]);
  
  // Toggle birds-eye view
  const toggleBirdsEyeView = useCallback(() => {
    setShowBirdsEyeView(!showBirdsEyeView);
    
    if (!containerRef.current) return;
    
    const svg = d3.select(containerRef.current).select('svg');
    const zoom = d3.zoomTransform(svg.node() as any);
    
    // Apply zoom transformation
    const newZoom = showBirdsEyeView ? 0.8 : 0.4;
    svg.transition()
      .duration(500)
      .call(
        (d3.zoom() as any).transform,
        d3.zoomIdentity
          .translate(dimensions.width / 2, dimensions.height / 2)
          .scale(newZoom)
          .translate(-dimensions.width / 2, -dimensions.height / 2)
      );
  }, [dimensions, showBirdsEyeView]);

  return (
    <section className="max-w-5xl mx-auto mb-16">
      <motion.div 
        className="glass-dark rounded-3xl p-6 shadow-glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-orbitron font-semibold flex items-center">
            <Network className="h-6 w-6 mr-2 text-neon-blue" />
            Verse Connection Mapper
          </h2>
          
          <div className="flex items-center space-x-3">
            <button 
              className={`px-3 py-1 text-sm rounded-lg flex items-center ${
                showBirdsEyeView 
                  ? 'bg-neon-blue/20 text-neon-blue' 
                  : 'bg-dark-600 text-light-300 hover:bg-dark-700'
              } transition-all duration-300`}
              onClick={toggleBirdsEyeView}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Bird's Eye View
            </button>
          </div>
        </div>
        
        <div className="bg-black/30 text-light-100 p-4 rounded-lg border border-gray-700 mb-6">
          <h3 className="text-lg font-medium mb-2 text-primary-300">What is this visualization?</h3>
          <p className="mb-3">This network graph shows how Thirukkural verses are connected to each other. Each circle (node) represents a verse from Thirukkural, and the lines show relationships between verses.</p>
          
          <h4 className="font-medium text-white mb-1">How to use this visualization:</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><span className="text-neon-blue font-medium">Click</span> on any circle to view that verse</li>
            <li><span className="text-neon-blue font-medium">Hover</span> over a circle to highlight its connections</li>
            <li><span className="text-neon-blue font-medium">Drag</span> circles to rearrange the network</li>
            <li>Use <span className="text-neon-blue font-medium">mouse wheel</span> to zoom in and out</li>
          </ul>
          
          <h4 className="font-medium text-white mt-3 mb-1">What the colors mean:</h4>
          <p className="text-sm">Verses are colored by their section in Thirukkural: blue for Virtue (Aram), green for Wealth (Porul), and purple for Love (Inbam). Brighter, larger circles indicate more important verses.</p>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-xs text-light-300">Virtue (Aram)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-xs text-light-300">Wealth (Porul)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
            <span className="text-xs text-light-300">Love (Inbam)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-1 bg-white/20 mr-2"></div>
            <span className="text-xs text-light-300">Connection strength</span>
          </div>
        </div>
        
        {/* Graph container */}
        <div className="relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-neon-blue/20 border border-neon-blue rounded-lg px-3 py-1 z-10">
            <span className="text-neon-blue text-xs font-semibold">Interactive Network Visualization</span>
          </div>
          
          <div 
            ref={containerRef} 
            className="w-full h-[500px] bg-gradient-to-b from-dark-800 to-dark-700 rounded-xl border border-primary-500/30 overflow-hidden shadow-[0_0_30px_rgba(0,100,200,0.1)] transition-all duration-300"
          >
            <svg width={dimensions.width} height={dimensions.height}>
              <g className="links"></g>
              <g className="nodes"></g>
            </svg>
            
            {graphData.nodes.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-light-300">
                <div className="text-center">
                  <div className="animate-pulse mb-3">
                    <Network className="h-12 w-12 mx-auto text-primary-500/50" />
                  </div>
                  <p className="text-sm">Select a verse to visualize connections</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Node info */}
        {selectedNode && (
          <motion.div 
            className="mt-6 p-6 bg-dark-600/80 rounded-xl border border-primary-500/30 shadow-[0_0_15px_rgba(0,100,200,0.1)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-medium text-light-100 flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: selectedNode.color }}></div>
                  Verse {selectedNode.kuralNumber}
                </h3>
                <p className="text-primary-300 text-sm font-medium">
                  Chapter {selectedNode.chapter}: {selectedKural?.chapterName}
                </p>
              </div>
              
              <div className="bg-dark-800/70 rounded-lg px-3 py-1 border border-gray-700">
                <span className="text-xs text-light-300">Section: {selectedKural?.sectionName}</span>
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-black/30 rounded-lg border border-gray-700">
              <div className="prose prose-sm prose-invert max-w-none">
                <p className="text-light-100">{selectedKural?.english}</p>
              </div>
            </div>
            
            <div className="mt-4 bg-neon-blue/10 rounded-lg border border-neon-blue/30 p-3">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-neon-blue" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-semibold text-neon-blue">Network Insights</span>
              </div>
              <p className="text-xs text-light-300">
                This verse has {graphData.links.filter(link => {
                  const sourceId = typeof link.source === 'object' ? link.source?.id : link.source;
                  const targetId = typeof link.target === 'object' ? link.target?.id : link.target;
                  return sourceId === selectedNode.id || targetId === selectedNode.id;
                }).length} connections to other verses. 
                <span className="text-neon-blue block mt-1">Click on different nodes in the network to explore related verses.</span>
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}