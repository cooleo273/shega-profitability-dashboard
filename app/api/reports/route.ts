import { NextResponse } from 'next/server';

// Helper function to generate realistic data
function generateRealisticData(type: string, projectId: string, dateRange: any) {
  // Base data structure
  let data = {};
  
  switch (type) {
    case 'profitability':
      // Generate profitability data with realistic project names and numbers
      const profitabilityData = [
        {
          id: "1",
          name: "Website Redesign",
          revenue: Math.floor(Math.random() * 50000) + 50000,
          cost: Math.floor(Math.random() * 30000) + 30000,
          profit: 0, // Will calculate
          margin: 0, // Will calculate
        },
        {
          id: "2",
          name: "Mobile App Development",
          revenue: Math.floor(Math.random() * 70000) + 80000,
          cost: Math.floor(Math.random() * 50000) + 50000,
          profit: 0, // Will calculate
          margin: 0, // Will calculate
        },
        {
          id: "3",
          name: "Brand Identity",
          revenue: Math.floor(Math.random() * 20000) + 25000,
          cost: Math.floor(Math.random() * 15000) + 20000,
          profit: 0, // Will calculate
          margin: 0, // Will calculate
        },
        {
          id: "4",
          name: "E-commerce Platform",
          revenue: Math.floor(Math.random() * 100000) + 150000,
          cost: Math.floor(Math.random() * 80000) + 100000,
          profit: 0, // Will calculate
          margin: 0, // Will calculate
        },
        {
          id: "5",
          name: "Marketing Campaign",
          revenue: Math.floor(Math.random() * 30000) + 40000,
          cost: Math.floor(Math.random() * 20000) + 25000,
          profit: 0, // Will calculate
          margin: 0, // Will calculate
        },
      ];
      
      // Calculate profit and margin
      profitabilityData.forEach(item => {
        item.profit = item.revenue - item.cost;
        item.margin = parseFloat(((item.profit / item.revenue) * 100).toFixed(2));
      });
      
      // Generate trend data
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const trendData = months.map(month => {
        const revenue = Math.floor(Math.random() * 50000) + 40000;
        const cost = Math.floor(Math.random() * 30000) + 30000;
        const profit = revenue - cost;
        const margin = parseFloat(((profit / revenue) * 100).toFixed(2));
        
        return {
          month,
          revenue,
          cost,
          profit,
          margin
        };
      });
      
      // Filter by project if needed
      const filteredData = projectId !== 'all' 
        ? profitabilityData.filter(item => item.id === projectId)
        : profitabilityData;
        
      data = {
        profitabilityData: filteredData,
        trendData
      };
      break;
      
    case 'billable-hours':
      // Generate billable hours data
      const teamMembers = [
        { id: "1", name: "John Doe", role: "Project Manager" },
        { id: "2", name: "Jane Smith", role: "Designer" },
        { id: "3", name: "Mike Johnson", role: "Developer" },
        { id: "4", name: "Sarah Williams", role: "QA Engineer" },
        { id: "5", name: "David Brown", role: "Business Analyst" }
      ];
      
      const billableHoursData = teamMembers.map(member => {
        const totalHours = 160;
        const billablePercentage = Math.floor(Math.random() * 30) + 70; // 70-100%
        const billableHours = Math.floor(totalHours * (billablePercentage / 100));
        
        return {
          id: member.id,
          name: member.name,
          role: member.role,
          totalHours,
          billableHours,
          billablePercentage,
          projects: [
            { 
              name: "Website Redesign", 
              hours: Math.floor(Math.random() * 80) + 40,
              billable: Math.floor(Math.random() * 70) + 30
            },
            { 
              name: "Mobile App Development", 
              hours: Math.floor(Math.random() * 60) + 30,
              billable: Math.floor(Math.random() * 50) + 25
            }
          ]
        };
      });
      
      data = { billableHoursData };
      break;
      
    case 'variance':
      // Generate variance data
      const varianceData = [
        {
          id: "1",
          name: "Website Redesign",
          plannedCost: Math.floor(Math.random() * 30000) + 40000,
          actualCost: Math.floor(Math.random() * 30000) + 40000,
          variance: 0, // Will calculate
          percentVariance: 0 // Will calculate
        },
        {
          id: "2",
          name: "Mobile App Development",
          plannedCost: Math.floor(Math.random() * 50000) + 70000,
          actualCost: Math.floor(Math.random() * 50000) + 70000,
          variance: 0,
          percentVariance: 0
        },
        {
          id: "3",
          name: "Brand Identity",
          plannedCost: Math.floor(Math.random() * 15000) + 25000,
          actualCost: Math.floor(Math.random() * 15000) + 25000,
          variance: 0,
          percentVariance: 0
        }
      ];
      
      // Calculate variance
      varianceData.forEach(item => {
        item.variance = item.plannedCost - item.actualCost;
        item.percentVariance = parseFloat(((item.variance / item.plannedCost) * 100).toFixed(2));
      });
      
      data = { varianceData };
      break;
      
    case 'cost-breakdown':
      // Generate cost breakdown data
      const costCategories = [
        { name: "Labor", value: Math.floor(Math.random() * 50000) + 100000 },
        { name: "Software", value: Math.floor(Math.random() * 20000) + 30000 },
        { name: "Hardware", value: Math.floor(Math.random() * 15000) + 20000 },
        { name: "Services", value: Math.floor(Math.random() * 25000) + 40000 },
        { name: "Other", value: Math.floor(Math.random() * 10000) + 15000 }
      ];
      
      data = { costCategories };
      break;
      
    default:
      data = { error: "Invalid report type" };
  }
  
  return data;
}

export async function GET(request: Request) {
  // Get query parameters
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'profitability';
  const projectId = searchParams.get('projectId') || 'all';
  const from = searchParams.get('from') || new Date().toISOString();
  const to = searchParams.get('to') || new Date().toISOString();
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate data based on report type
  const data = generateRealisticData(type, projectId, { from, to });
  
  return NextResponse.json(data);
}