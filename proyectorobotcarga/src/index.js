import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './styles.css';
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


function Mapa(props) {
  
    var arregloX = [], arregloY = [];
    let arr = props.mapaTxt.split(/\r?\n/);
    //console.log(arr);
    let dimensions = arr[0].split(',');
    if (dimensions.length != 2 && props.mapaTxt) {
      props.setErrorMsg("Ocurrio un error leyendo el archivo, Puede que no este en el formato aceptado.");
      return null;
    }
    let x, y;
    try {
      x = dimensions[0];
      y = dimensions[1];
    } catch (error) {
      props.setErrorMsg("Ocurrio un error leyendo el archivo");
    }
    for (let i = 0; i < dimensions[0]; i++) {
      arregloX[i] = i;
    }
    for (let i = 0; i < dimensions[1]; i++) {
      arregloY[i] = i;
    }
  
  function style(x, y) {
    console.log('X:', x, ' Y: ', y, ' ', arr[x+1].charAt(y));

    switch(arr[x + 1].charAt(y)) {
      case '-':
        return 'cuadro';
      case 'X':
      case 'x':
        return 'obstaculo';
      case '^':
        return 'robotUp';
        case '>':
          return 'robotRight';
      case '<':
        return 'robotLeft';
        case 'v':
        case 'V':
          return 'robotDown';
      case 'O':
      case 'o':
        return 'objetivo';
        case 'D':
        case 'd':
          return 'destino';
      default:
        props.setErrorMsg("El archivo contiene caracteres desconoidos, Favor revise el archivo seleccionado.");
        break;
    }
  }

  return (
    <div className="tablero" id="tablero">
      {arregloX.map((vacio, x) => (
        <div className="bg-dark" key={vacio}>
          {arregloY.map((vacio, y) => (
            <div className={style(x, y)} key={vacio}></div>
          ))}
        </div>
      ))}
    </div>
  )
}

function App() {
  let matriz = [];
  let matrizRegistro = [];
  var comandoActual = "";
  const [mapa, setMapa] = useState("");
  const [codigo, setCodigo] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function handleCodigo(codigo) {
    setCodigo(codigo);
    codigoMatriz(codigo);
  }
//REGISTROS ax bx cx dx ex fx gx hx ix jx kx lx mx nx ox px
  function comandoValido(comando){
    const palabras = comando.split(" ");
    if( palabras[0] == "avz" && palabras.lenght == 2){ //Valida el comando avz
      if( !isNaN(palabras[1]) ) //Valida si el segundo parametro es un numero
        return true;
        //Validar si el segundo parametro es un registro
    } else{

    }

  
  }

  function codigoMatriz(codigoTxt){
    for( var i = 0; i < 16; i++ ){
      var arregloTemp = []
      var registro = String.fromCharCode(97+i) + "x";
      arregloTemp.push(registro);
      arregloTemp.push(0);
      matrizRegistro.push(arregloTemp);
    }
    console.log(matrizRegistro);
    const lineas = codigoTxt.split(/\r?\n/);
    var arreglo = [];

    for( var i = 0; i < lineas.length; i++ ){

      lineas[i] = lineas[i].split("#")[0];

      if( lineas[i].split(" ").length == 1 && lineas[i].charAt(lineas[i].length-1) == ':' ){
        matriz.push(arreglo);
        arreglo = [];
        lineas[i] = lineas[i].substring(0, lineas[i].length - 1);
        arreglo.push(lineas[i]);
        //REVISAR SI ESTÁ DUPLICADO
      }
      if(lineas[i][0] != '#' && lineas[i].split(" ").length > 1 ){
        arreglo.push(lineas[i]);
        comandoValido(lineas[i]);
      }
    }
    matriz.push(arreglo);
    console.log(matriz);
  }

  return (
    <div>
      {errorMsg &&
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>{errorMsg}</strong>
          <button type="button" class="btn-close" data-dismiss="alert" onClick={(e) => (setErrorMsg(""))}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      }
      <Opciones mapa={mapa} handleMapa={setMapa}
        setErrorMsg={setErrorMsg} handleCodigo={handleCodigo} />
       <div className = "bg-dark container my-5 p-5 text-center">
        <Mapa setErrorMsg={setErrorMsg} mapaTxt={mapa}/>
      </div> 
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
