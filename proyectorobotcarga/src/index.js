import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

function Opciones(props) {

  function handleSubmit(event) {
    event.preventDefault();
    const file = event.target.files[0];
    if (file) {
      if (file.name.split('.').pop() != 'txt') {
        props.setErrorMsg("Solo se aceptan archivos .txt");
        return;
      }
      let reader = new FileReader();
      reader.onloadend = function(e) {
        let content = e.target.result;
        if (event.target.id == 'fileMapa') {
          props.handleMapa(content);
        } else if (event.target.id == 'fileCodigo') {
          props.handleCodigo(content);
        }
      }
      reader.readAsText(file);//necesario aunque no parezca
    } else {
      props.setErrorMsg("No se ha podido abrir el archivo");
    }
  }

  return (
    <div>
      <div>
        <div class="fileUpload btn btn-primary">
          <span>Cargar Mapa</span>
          <input type="file" class="upload" id='fileMapa' onChange={(e) => handleSubmit(e)}/>
        </div>
        {(props.mapa != "") &&
          <div class="fileUpload btn btn-primary">
            <span>Cargar Codigo</span>
            <input type="file" class="upload" id='fileCodigo' onChange={(e) => handleSubmit(e)}/>
          </div>
        }
      </div>
    </div>
  )
}


function App() {
  const [mapa, setMapa] = useState("");
  const [codigo, setCodigo] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  return (
    <div>
      {errorMsg &&
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
          <strong>{errorMsg}</strong>
          <button type="button" class="btn-close" data-dismiss="alert">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      }
      <Opciones mapa={mapa} handleMapa={setMapa}
        setErrorMsg={setErrorMsg} handleCodigo={setCodigo} />
      <label>
        {mapa}
      </label>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
