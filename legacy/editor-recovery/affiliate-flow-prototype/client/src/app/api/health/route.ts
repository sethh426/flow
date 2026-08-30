import { NextResponse } from 'next/server';

export async function GET() {
  const services = [
    { name: 'Vision Analyzer', url: 'http://localhost:8083/health', description: 'Image analysis & brand safety' },
    { name: 'Workflow Executor', url: 'http://localhost:8081/health', description: 'Automation workflows' },
    { name: 'Product Mapper', url: 'http://localhost:8082/health', description: 'Product search & affiliate links' },
  ];

  const statuses = await Promise.all(
    services.map(async (service) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const res = await fetch(service.url, { 
          signal: controller.signal,
          cache: 'no-store'
        });
        
        clearTimeout(timeoutId);
        
        return { 
          name: service.name,
          description: service.description,
          status: res.ok ? 'online' : 'offline',
          url: service.url.replace('/health', '')
        };
      } catch (error) {
        return { 
          name: service.name,
          description: service.description,
          status: 'offline',
          url: service.url.replace('/health', '')
        };
      }
    })
  );

  const allOnline = statuses.every(s => s.status === 'online');
  const onlineCount = statuses.filter(s => s.status === 'online').length;

  return NextResponse.json({ 
    status: allOnline ? 'healthy' : 'partial',
    timestamp: new Date().toISOString(),
    services: statuses,
    summary: {
      total: services.length,
      online: onlineCount,
      offline: services.length - onlineCount
    }
  });
}
