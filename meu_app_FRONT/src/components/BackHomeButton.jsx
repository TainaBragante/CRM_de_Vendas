import { useNavigate } from "react-router-dom";


/* Botão reutilizável para voltar à Home (página inicial).*/

export default function BackHomeButton({ label = "Voltar" }) {
  const navigate = useNavigate();
  return (
    <button className="backBtn" onClick={() => navigate("/")}>
      {label}
    </button>
  );
}

