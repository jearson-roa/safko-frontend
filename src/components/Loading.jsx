
import "./Loading.css";

const Loading = ({ mensaje = "Cargando..." }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <p>{mensaje}</p>
    </div>
  );
};

export default Loading;