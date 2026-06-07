const Loading = ({ mensaje = "Cargando..." }) => (
       <div className="loading-overlay">
         <div className="spinner"></div>
      <p className="loading-text">{mensaje}</p>
    </div>

  );
  export default Loading;
