export async function GET() {
  return Response.json({ dummy: 'data' });
}

export async function POST(request) {
  const data = await request.json();
  console.log(data);
  return Response.json({ message: 'Data logged', dummy: 'response' });
}
