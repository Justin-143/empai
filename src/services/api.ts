const API_BASE = "https://palaced-sharonda-thirtypenny.ngrok-free.dev";

export async function predictPerformance(employeeData: any) {
  const res = await fetch(`${API_BASE}/api/predict`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true"
    },
    body: JSON.stringify(employeeData)
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || res.statusText);
  }
  return await res.json();
}

export async function getFeatureImportance() {
  const res = await fetch(`${API_BASE}/api/feature-importance`, {
    headers: { "ngrok-skip-browser-warning": "true" }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || res.statusText);
  }
  return await res.json();
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/health`, {
    headers: { "ngrok-skip-browser-warning": "true" }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || res.statusText);
  }
  return await res.json();
}
