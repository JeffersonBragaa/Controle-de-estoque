const url = "https://xmpgmbcwychabclksool.supabase.co/rest/v1/produtos";
const key = "sb_publishable_cpvjPeSFzoyFHx2E-cuzjA_rlT7VmVN";

async function test() {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      id: "00000000-0000-0000-0000-000000000001",
      nome: "teste",
      quantidade: 1,
      local: "A",
      corredor: "B",
      gaveta: "C",
      criadoEm: "2026-07-01T15:00:00Z",
      atualizadoEm: "2026-07-01T15:00:00Z"
    })
  });
  const text = await res.text();
  console.log(res.status, text);
}
test();
