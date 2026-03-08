import { useEffect, useState } from "react";

function App() {
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch("/api/saludo") // usa proxy
      .then(res => res.json())
      .then(data => setMensaje(data.mensaje))
      .catch(err => console.error("Error:", err));
  }, []);

  return (
    <div>
      <h1>Frontend React</h1>
      <p>{mensaje}</p>
    </div>
  );
}

export default App;