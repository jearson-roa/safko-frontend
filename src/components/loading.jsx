const Loading = ({ mensaje = "Cargando..." }) => (
  <div style={styles.overlay}>
    <div className="spinner"></div>
    <p>{mensaje}</p>
  </div>
  ); 
  
  
  const styles = {
   overlay: {
     display: 'flex',
     flexDirection: 'column',
     alignItems: 'center',
     justifyContent: 'center',
     padding: '20px'
   }
 };

 export default Loading;
