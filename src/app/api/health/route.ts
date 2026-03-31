export async function GET() {
  return Response.json({
    ok: true,
    service: "encarparse",
    now: new Date().toISOString(),
  });
}
