import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

function Opciones(props) {

  function handleSubmit(event) {
    event.preventDefault();
    const file = event.target.files[0];
    props.setErrorMsg();
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        let content = e.target.result;
        props.handleMapa(content);
      }
    }
  }

  return (
    <div>
      <div>
        <div class="fileUpload btn btn-primary">
          <span>Cargar Mapa</span>
          <input type="file" class="upload" id='file' onChange={(e) => handleSubmit(e)}/>
        </div>
        {(props.mapa != "") &&
          <div class="fileUpload btn btn-primary">
            <span>Cargar Codigo</span>
            <input type="file" class="upload" />
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

  function handleMapa(val) {
    setMapa(val);
    console.log("xczdc", mapa);
  }

  return(
    <div>
      <Opciones mapa={mapa} handleMapa={handleMapa} setErrorMsg={setErrorMsg}/>
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
