import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import './styles.css';
import './index.css';
import reportWebVitals from './reportWebVitals';
import useInterval from './hooks/useInterval';


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
          props.setErroresCodigo("");
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
        {(props.codigo != "") &&
          <button type="button" class="btn btn-success" onClick={props.setIniciar(true)}
          >Iniciar</button>
        }
      </div>
    </div>
  )
}


function Mapa(props) {
    var arregloX = [], arregloY = [];
    for (let i = 0; i < props.x; i++) {
      arregloX[i] = i;
    }
    for (let i = 0; i < props.y; i++) {
      arregloY[i] = i;
    }
    //console.log(props.x, ': ' ,props.arr);
  function style(x, y) {
    let cargando = (props.objetivoMontado) ? "Con" : "";
    switch(props.arr[x].charAt(y)) {
      case '-':
        return 'cuadro';
      case 'X':
      case 'x':
        return 'obstaculo';
      case '^':
        props.setDir(90);
        return 'robotUp' + cargando;
      case '>':
          props.setDir(0);
          return 'robotRight' + cargando;
      case '<':
        props.setDir(180);
        //cargando = ""
        //if props.carga
        //cargando = "conCarga"
        return 'robotLeft' + cargando;// + cargando;
      case 'v':
      case 'V':
          props.setDir(270);
          return 'robotDown' + cargando;
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
            <div id={(x * arregloY.length) + y} className={style(x, y)} key={vacio}></div>
          ))}
        </div>
      ))}
    </div>
  )
}

function ErrorMsgCodigo(props) {

  function separarLineas(errores) {
    //console.log(errores);
    return errores.split(/\r?\n/);
  }

  if (props.errores) {
    return (
      <div id="errores" className="bg-dark text-danger container">
        {separarLineas(props.errores).map(line => <p>{line}</p>)}
      </div>
    );
  } else {
    return null;
  }
}

function App() {
  //var stack = [];
  var error = "";
  let matrizTeemporal = [];
  const [matriz, setMatriz] = useState([]);
  const [stack, setStack] = useState([]);
  const matrizRe = useRef([]);
  let matrizRegistro = [];
  const fil = useRef(0);
  const col = useRef(0);
  const moves = useRef(0);
  const [errorCodigo, setErrorCodigo] = useState("");
  const [mapa, setMapa] = useState("");
  const [arregloMapa, setArregloMapa] = useState("");
  const [codigo, setCodigo] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [dir, setDir] = useState(0);
  const [objetivoMontado, setObjetivoMontado] = useState(false);
  const [sizeX, setSizeX]  = useState(0);
  const [sizeY, setSizeY]  = useState(0);
  const [iniciar, setIniciar] = useState(false);

  useEffect(() => {//codigo
    codigoMatriz(codigo);
    matrizRe.current = [];
    const matriztmp = [];
    for( var i = 0; i < 16; i++ ) {
      var arregloTemp = []
      var registro = i + "R";
      arregloTemp.push(registro);
      arregloTemp.push(0);
      matriztmp.push(arregloTemp);
    }
    matrizRe.current = matriztmp;
  }, [codigo]);

  function updateMatriz(arr) {
    setMatriz(matrizTemp => [...matrizTemp, arr]);
  }

  function stackPop() {
    const tempStack = [...stack];
    const value = tempStack.pop();
    setStack(tempStack);
    return value;
  }

  function stackPush(value) {
    setStack(tempStack => [...tempStack, value]);
  }

  useEffect(() => {//arregloMapa
    for (let i = 0; i < arregloMapa.length; i++) {
      const line = arregloMapa[i];
      for (let j = 0; j < line.length; j++) {
        switch (line.charAt(j)) {
          case 'v':
          case 'V':
          case '>':
          case '<':
          case '^':
            setPosX(i);
            setPosY(j);
            break;
        }        
      }
    }
  }, [arregloMapa]);

  useEffect(() => {
    //console.log('mm', matriz);
  }, [matriz]);

  useEffect(() => {//mapa
    setArregloMapa([]);
    let arr = mapa.split(/\r?\n/);
    let dimensions = arr[0].split(',');
    if (dimensions.length != 2 && mapa) {
      setErrorMsg("Ocurrio un error leyendo el archivo, Puede que no este en el formato aceptado.");
      return;
    }
    try {
      const x = dimensions[0];
      const y = dimensions[1];
      setSizeX(x);
      setSizeY(y);
      setArregloMapa(arr.slice(1, arr.length));
    } catch (error) {
      setErrorMsg("Ocurrio un error leyendo el archivo");
    }
  }, [mapa]);

  useInterval(() => {
    if (moves.current > 0) {
      let pos = 0;
      moves.current = moves.current - 1;
      //console.log('MOVING');
      if (dir == 0) {
        handleArregloMapaUpdate(posX, posY, '-', posX, posY + 1, '>', moves.current);
      } else if (dir == 90) {
        handleArregloMapaUpdate(posX, posY, '-', posX - 1, posY, '^', moves.current);
      } else if (dir == 180) {
        handleArregloMapaUpdate(posX, posY, '-', posX, posY - 1, '<', moves.current);
      } else if (dir == 270 /*&& enfrente("rgb(84, 94, 105))*/) {
        handleArregloMapaUpdate(posX, posY, '-', posX + 1, posY, 'v', moves.current);
      }
    } else {
      var comandoActual = "";
      var Registros = "";
      let z = 0;
      try {
        comandoActual = matriz[fil.current][col.current];
        console.log(comandoActual);
        ejecutarComando(comandoActual);
        Registros = "";
        for (var i = 0; i < 16; i++) {
          Registros += "[" + matrizRe.current[i][1] + "]";
        }
        console.log(Registros);
        if (fil.current == matriz.length - 1 && col.current == matriz[fila].length)
          return;
      } catch (error) {
        let errores = "";
        setErrorCodigo(errores);
      }
      function ejecutarComando(comando) {
        var terminoJump = false;
        const palabras = comando.split(" ");
        switch (palabras[0]) {
          case "avz":
            let pos = 0;
            const numero = convertirNumero(palabras[1]);
            console.log('dir: ', dir);
            //const robotAntes = document.getElementById(posX * sizeY + posY);
            //Cambiar el estilo
            if (dir == 0) {
              handleArregloMapaUpdate(posX, posY, '-', posX, posY + 1, '>', numero);
            } else if (dir == 90) {
              handleArregloMapaUpdate(posX, posY, '-', posX - 1, posY, '^', numero);
            } else if (dir == 180) {
              handleArregloMapaUpdate(posX, posY, '-', posX, posY - 1, '<', numero);
            } else if (dir == 270 /*&& enfrente("rgb(84, 94, 105))*/) {
              handleArregloMapaUpdate(posX, posY, '-', posX + 1, posY, 'v', numero);
            }
            //const robotDespues = document.getElementById(posX * sizeY + posY);
            //Cambiamos el estilo
            // sleep(500);
            if (numero > 1) {
              moves.current = numero;
            } else {
              moves.current = 0;
            }
            break;

          case "rtr":
            const idActual = posX * sizeY + posY;
            const robot = document.getElementById(idActual);
            document.getElementById(idActual + 1);
            if (dir == 0 && palabras[1] == -90) {
              setDir(270);
            } else if (dir == 270 && palabras[1] == 90) {
              setDir(0);
            } else {
              let direccion = dir + palabras[1];
              setDir(direccion);
            }
            // let path = "./images/robot/";
            // if(objetivoMontado == 1)
            //   path += "conCarga/";
            // else
            //   path += "sinCarga/";
            // if(dir == 0)
            //   path += "derecha.png";
            // else if(dir == 90)
            //   path += "arriba.png";
            // else if(dir == 180)
            //   path += "izquierda.png";
            // else if(dir == 270)
            //   path += "abajo.png";
            // robot.style.backgroundImage = path;
            break;

          case "crg":
            if (palabras[1] == 0) {
              if (objetivoMontado == 1) {
                setObjetivoMontado(0);

                //enfrente("rgb(84, 94, 105)")
                /* const idActual = posX * sizeY + posY;
                 let frente;
                 let path = "./images/robot/sinCarga/";
                 if(dir == 0){
                   frente = document.getElementById(idActual + 1);
                   path += "derecha.png";
                 }else if(dir == 90){
                   frente  = document.getElementById(idActual + sizeY);
                   path += "arriba.png";
                 }else if(dir == 180){
                   frente  = document.getElementById(idActual - 1);
                   path += "izquierda.png";
                 }else if(dir == 270){
                   frente  = document.getElementById(idActual - sizeY);
                   path += "abajo.png";
                 }
                 //Cambiar imagen del robot con el path
                 frente.style.backgroundImage = "url('./images/elementos/objetivo.png');";
                 frente.style.backgroundColor = "rgb(221, 255, 31);";*/
                //CAMBIAR IMAGEN
                //Poner la caja en el lugar indicado
              }
            } else {
              if (objetivoMontado == 0 && enfrente("rgb(221, 255, 31)")) {
                setObjetivoMontado(1);
                //CAMBIAR IMAGEN
                //Quitar la caja  del frente/
              }
            }
            break;

          case "push":
            if (esNumero(palabras[1]))
              //stack.push(palabras[1]);
              stackPush(palabras[1]);
            else {
              let idRegistro = palabras[1].split("R")[0];
              //stack.push(matrizRegistro[idRegistro][1]);
              stackPush(matrizRe.current[idRegistro][1]);
            }
            break;

          case "pop":
            let idRPop = palabras[1].split("R")[0];
            //matrizRegistro[idRPop][1] = stack.pop();
            matrizRe.current[idRPop][1] = stackPop();
            break;

          case "snsd": //Direccion
            let idRSnsd = palabras[1].split("R")[0];
            matrizRe.current[idRSnsd][1] = dir;
            break;

          case "snsm": //Muro enfrente
            let idRSnsm = palabras[1].split("R")[0];
            if (enfrente("rgb(0, 0, 0)"))
              matrizRe.current[idRSnsm][1] = 1;
            else
              matrizRe.current[idRSnsm][1] = 0;
            break;

          case "snso": //Objetivo enfrente
            let idRSnso = palabras[1].split("R")[0];
            if (enfrente("rgb(221, 255, 31)"))
              matrizRe.current[idRSnso][1] = 1;
            else
              matrizRe.current[idRSnso][1] = 0;
            break;

          case "snsdf": //Destino enfrente
            let idRSnsdf = palabras[1].split("R")[0];
            if (enfrente("rgb(83, 255, 49)"))
              matrizRe.current[idRSnsdf][1] = 1;
            else
              matrizRe.current[idRSnsdf][1] = 0;
            break;

          case "snsom": //Objeto montado
            const idRSnsom = palabras[1].split("R")[0];
            if (objetivoMontado)
              matrizRe.current[idRSnsom][1] = 1;
            else
              matrizRe.current[idRSnsom][1] = 0;
            break;

          case "snsp":
            var valorGuardar;
            if (palabras[1] == "x")
              valorGuardar = posX;
            else
              valorGuardar = posY;
            matrizRe.current[15][1] = valorGuardar;
            break;

          case "not":
            if (convertirNumero(palabras[1]) != 0)
              matrizRe.current[14][1] = 0;
            else
              matrizRe.current[14][1] = 1;
            break;

          case "mov":
            const idR1 = palabras[1].split("R")[0];
            var num;
            num = convertirNumero(palabras[2]);
            matrizRe.current[idR1][1] = num;
            break;

          case "sum":
            var num1, num2;
            num1 = convertirNumero(palabras[1]);
            num2 = convertirNumero(palabras[2]);
            const idRSum = palabras[3].split("R")[0];
            matrizRe.current[idRSum][1] = (parseInt(num1) + parseInt(num2));
            break;

          case "rst":
            var num1, num2;
            num1 = convertirNumero(palabras[1]);
            num2 = convertirNumero(palabras[2]);
            const idRst = palabras[3].split("R")[0];
            matrizRe.current[idRst][1] = (parseInt(num1) - parseInt(num2));
            break;

          case "mul":
            var num1, num2;
            num1 = convertirNumero(palabras[1]);
            num2 = convertirNumero(palabras[2]);
            const idRMul = palabras[3].split("R")[0];
            matrizRe.current[idRMul][1] = (parseInt(num1) * parseInt(num2));
            break;

          case "div": //R13
            var num1, num2;
            num1 = convertirNumero(palabras[1]);
            num2 = convertirNumero(palabras[2]);
            const idRDiv = palabras[3].split("R")[0];
            matrizRe.current[idRDiv][1] = (parseInt(num1) / parseInt(num2));
            matrizRe.current[13][1] = (parseInt(num1) % parseInt(num2));
            break;

          case "cmp": //Registro R12
            var num1, num2;
            num1 = convertirNumero(palabras[1]);
            num2 = convertirNumero(palabras[2]);
            if (num1 == num2)
              matrizRe.current[12][1] = 0;
            else if (num1 > num2)
              matrizRe.current[12][1] = 1;
            else if (num1 >= num2)
              matrizRe.current[12][1] = 2;
            else if (num1 < num2)
              matrizRe.current[12][1] = -1;
            else if (num1 <= num2)
              matrizRe.current[12][1] = -2;
            break;

          case "and": //Registro R11
            var num1, num2;
            num1 = convertirNumero(palabras[1]);
            num2 = convertirNumero(palabras[2]);
            if (num1 != 0 && num2 != 0)
              matrizRe.current[11][1] = 1;
            else
              matrizRe.current[11][1] = 0;
            break;

          case "or": //Registro R10
            var num1, num2;
            num1 = convertirNumero(palabras[1]);
            num2 = convertirNumero(palabras[2]);
            if (num1 != 0 || num2 != 0)
              matrizRe.current[10][1] = 1;
            else
              matrizRe.current[10][1] = 0;
            break;

          case "jmp":
            jumpEtiqueta(palabras[1]);
            break;

          case "jmle": //Registro R12
            if (matrizRe.current[12][1] == -2)
              jumpEtiqueta(palabras[1]);
            else
              terminoJump = true;
            break;

          case "jml": //Registro R12
            if (matrizRe.current[12][1] == -1)
              jumpEtiqueta(palabras[1]);
            else
              terminoJump = true;
            break;

          case "jme": //Registro R12
            if (matrizRe.current[12][1] == 0)
              jumpEtiqueta(palabras[1]);
            else
              terminoJump = true;
            break;

          case "jmh": //Registro R12
            if (matrizRe.current[12][1] == 1)
              jumpEtiqueta(palabras[1]);
            else
              terminoJump = true;
            break;

          case "jmhe": //Registro R12
            if (matrizRe.current[12][1] == 2)
              jumpEtiqueta(palabras[1]);
            else
              terminoJump = true;
            break;

          case "log":
            break;
        }
        if (!esJump(comando) || terminoJump) {
          if (columna == matriz[fila].length - 1) {
            fila++;
            fil.current = fil.current + 1;
            columna = 0;
            col.current = 0;
          } else
            columna++;
          col.current = col.current + 1;
        }
      }

      function jumpEtiqueta(etiqueta) {
        for (var i = 0; i < matriz.length; i++) {
          if (matriz[i][0] == etiqueta) {
            fila = i;
            fil.current = i;
            columna = 0;
            col.current = 0;
          }
        }
      }
      
    }
    console.log(fil.current, arregloMapa);
  }, 1000);
  

  function handleArregloMapaUpdate(lineaOld, indexOld, charReplace, lineaNew, indexNew, charNew, rmoves = 0) {
    function setCharAt(str,index,chr) {
      let string = "";
      for (let i = 0; i < str.length; i++) {
        if (i == index) {
          string += chr;
        } else {
          string += str.charAt(i);
        } 
      }
      console.log('charRp', str.substring(0,index) + chr + str.substring(index+1));
      console.log(string);
      return string;
  }
    const arr = [...arregloMapa];
    arr[lineaOld] = setCharAt(arr[lineaOld], indexOld,charReplace);
    arr[lineaNew] = setCharAt(arr[lineaNew], indexNew,charNew);
    moves.current = rmoves;
    setArregloMapa(arr);
  }

  function esNumero(parametro){
    if( !isNaN(parametro) ) //Valida si el segundo parametro es un numero
      return true;
    return false;
  }

  function esRegistro(parametro){
    for(var i = 0; i < 16; i++ ){
      if(parametro == matrizRe.current[i][0])
        return true;
    }
    return false;
  }

  function esNumeroRegistro(parametro){
    if(esRegistro(parametro) || esNumero(parametro))
      return true;
    return false;
  }

  function existeEtiqueta(parametro){
    for(var i = 0; i < matrizTeemporal.length; i++){
      if(matrizTeemporal[i][0] == parametro)
        return true;
    }
  }

  function esJump(parametro){
    const palabras = parametro.split(" ");
    if(palabras[0] == "jmp" || palabras[0] == "jme" || palabras[0] == "jmle" || palabras[0] == "jmhe" || palabras[0] == "jml" || palabras[0] == "jmh")
      return true;
    return false;
  }

  function jumpValido(jumps){
    error = "";
    const palabras = jumps.split(" ");
    const etiqueta = palabras[1].split("%")[0];
    if(palabras.length == 2){
      if(!existeEtiqueta(etiqueta)){
        error = "El parametro de los comandos jump solo pueden ser etiquetas";    
        return false;
      }else{
        return true;
      }
    }
    error = "Cantidad invalida de parametros";
    return false;
  }

  function comandoValido(comando) {
    error = "El comando ingresado no existe";
    const palabras = comando.split(" ");
    var i = palabras.indexOf("");
    if ( i !== -1 ) {
        palabras.splice( i, 1 );
    }
    if(palabras[0] != "jmp" && palabras[0] != "jme" && palabras[0] != "jmle" && palabras[0] != "jmhe" && palabras[0] != "jml" && palabras[0] != "jmh"){
      if(palabras.length == 2){
        if( palabras[0] == "avz"){ //Valida el comando avz
          if( esNumero(palabras[1]) ) //Valida si el segundo parametro es un numero
            return true;
          else if(esRegistro(palabras[1]))
              return true;
          error = "Parametro de comando 'avz' invalido";
        }else if( palabras[0] == "rtr"){
          if(palabras[1] == 90 || palabras[1] == -90)
            return true;
          error = "El parametro del comando 'rtr' solo puede ser 90 o -90";
        }else if( palabras[0] == "crg" ){
          if(palabras[1] == 1 || palabras[1] == 0)
            return true;
            error = "El parametro del comando 'crg' solo puede ser 0 o 1";
        }else if( palabras[0] == "push" || palabras[0] == "pop" ){
          if(esRegistro(palabras[1]))
            return true;
            error = "El parametro del comando 'push/pop' solo pueden ser un registro";
        }else if( palabras[0] == "snsp"){
          if(palabras[1] == 'x' || palabras[1] == 'y')
              return true;
            error = "El parametro del comando 'snsp' debe ser uno de los ejes x/y";
        }else if( palabras[0] == "snsd" || palabras[0] == "snsm" || palabras[0] == "snso" || palabras[0] == "snsd" || palabras[0] == "snsom" ){
          if(esRegistro(palabras[1]))
              return true;
            error = "El parametro del comando 'snsd/snse' debe ser un registro";
        }else if( palabras[0] == "not"){
          if(esRegistro(palabras[1]))
              return true;
            error = "El parametro del comando 'not' debe ser un registro";
        }
      }else if(palabras.length == 3){
        if( palabras[0] == "mov"){ //Valida el comando avz
          if( esRegistro(palabras[1]) && esNumeroRegistro(palabras[2]) )
            return true;
          error = "Los Parametros del comando 'mov' deben ser REGISTRO   REGISTRO/NUMERO";
        }else if( palabras[0] == "and" || palabras[0] == "or" || palabras[0] == "cmp" ){
          if(esNumeroRegistro(palabras[1]) && esNumeroRegistro(palabras[2]))
              return true;
          error = "Los parametros deben ser REGISTRO/NUMERO  REGISTRO/NUMERO";
        }
      }else if(palabras.length == 4){
        if( palabras[0] == "sum" || palabras[0] == "rst" || palabras[0] == "mul" || palabras[0] == "div"){
          if(esNumeroRegistro(palabras[1]) && esNumeroRegistro(palabras[2]) && esRegistro(palabras[3]))
            return true;
          error = "Los parametros deben ser REGISTRO/NUMERO   REGISTRO/NUMERO";
        }
      }else{
        error = "Cantidad invalida de parametros";
      }
      return false;
    }
    return true;
  }

  function codigoMatriz(codigoTxt) {
    //const erroresFrame = document.getElementById("errores");
    //erroresFrame.innerText = "";
    let errores = "";
    var jumps = [];
    for( var i = 0; i < 16; i++ ) {
      var arregloTemp = []
      var registro = i + "R";
      arregloTemp.push(registro);
      arregloTemp.push(0);
      matrizRegistro.push(arregloTemp);
    }
    const lineas = codigoTxt.split(/\r?\n/);
    var arreglo = [];

    for( var i = 0; i < lineas.length; i++ ) {
      lineas[i] = lineas[i].split("#")[0];
      lineas[i] = lineas[i].replace("\t","");
      if( lineas[i].split(" ").length == 1 && lineas[i].charAt(lineas[i].length-1) == ':' ){
        //matriz.push(arreglo);
        matrizTeemporal.push(arreglo);
        //updateMatriz(arreglo);
        arreglo = [];
        lineas[i] = lineas[i].substring(0, lineas[i].length - 1);
        if(existeEtiqueta(lineas[i])){
          //erroresFrame.innerText += "Error en la linea: " + (i+1) + "\n" +lineas[i] + "\nEtiqueta repetida\n\n";
          // console.log("Error en la linea: " + i + "\n" +lineas[i] + "\nEtiqueta repetida\n");
          errores += "Error en la linea: " + (i+1) + "\n" +lineas[i] + "\nEtiqueta repetida\n\n";
        }else 
          arreglo.push(lineas[i]);
        
      }
      if(lineas[i][0] != '#' && lineas[i].split(" ").length > 1 ){
        arreglo.push(lineas[i]);
        if( !comandoValido(lineas[i]) )
          //erroresFrame.innerText += "Error en la linea: " + (i+1) + "\n" +lineas[i] + "\n" + error + "\n\n";
          // console.log("Error en la linea: " + i + "\n" +lineas[i] + "\n" + error + "\n");
          errores += "Error en la linea: " + (i+1) + "\n" +lineas[i] + "\n" + error + "\n\n";
        if(esJump(lineas[i]))
          jumps.push(lineas[i] + "%" + (i+1));
      }
    }
    //matriz.push(arreglo);
    matrizTeemporal.push(arreglo);
    //updateMatriz(arreglo);
    for(var i = 0; i < jumps.length; i++ ){
      if(!jumpValido(jumps[i])){
        const jmp = jumps[i].split(" ")[0] + " " + jumps[i].split(" ")[1].split("%")[0];
        //erroresFrame.innerText += "Error en la linea: " + jumps[i].split(" ")[1].split("%")[1] + "\n" + jmp + "\n" + error + "\n\n";
        errores += "Error en la linea: " + jumps[i].split(" ")[1].split("%")[1] + "\n" + jmp + "\n" + error + "\n\n";
      }
        if (errores != "") {
          setErrorCodigo(errores); 
        } else {
          setMatriz(matrizTeemporal);
        }
    }
    //console.log('mat: ', matriz);
  }
  
  function convertirNumero(parametro) {
    if(esRegistro(parametro)){
      const idR1 = parametro.split("R")[0];
      return matrizRe.current[idR1][1];
    }else
      return parametro;
  }

  var fila = 0, columna = 0, comandoActual = "";
  /*function ejecutarPrograma() {
    var Registros = "";
    try{
      while(true){
        comandoActual = matriz[fila][columna];
        console.log(comandoActual);
        sleep(500);
        ejecutarComando(comandoActual);
        Registros = "";
        for(var i = 0; i < 16; i++){
          Registros += "["+matrizRegistro[i][1]+"]";
        }
        console.log(Registros);
        if( fila == matriz.length - 1 && columna == matriz[fila].length)
          break;
      }
    }catch(error){
      let errores = "";
      setErrorCodigo(errores);
    }
  }

  function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
     if ((new Date().getTime() - start) > milliseconds) {
      break;
     }
    }
   }*/

  function enfrente(parametro) {
    let siguienteCasilla = -1;
    let idActual = posX * sizeY + posY;
    if(dir == 0){
      if( (idActual % sizeY ) != (sizeY - 1) )
        siguienteCasilla = document.getElementById(idActual + 1);
    }else if(dir == 90){
      if( idActual - sizeY >= 0)
        siguienteCasilla = document.getElementById(idActual - sizeY);
    }else if(dir == 180){
      if( idActual % sizeY != 0 )
        siguienteCasilla = document.getElementById(idActual - 1);
    }else if(dir == 270){
      if(idActual + sizeY <= sizeY * sizeX)
        siguienteCasilla = document.getElementById(idActual + sizeY);
    }
    if( siguienteCasilla == -1){
      return false;
    }else
      if(siguienteCasilla.style.backgroundColor == parametro)
        return true;
    //Si hay obstaculo
    //Si esta en el borde
    //Si hay una caja enfrente
    /* 
          x * sizeY + y <- idActual
          idActual % (size(y)) == (size(y) - 1) <- Valida si estoy en el borde derecho
          idActual % size(y) == 0 <- Valida si estoy en el borde izquierdo
          idActual + size(y) > size(y)*size(x) <- Valida si estoy pasandome del borde inferior
          idActual - size(y) < 0 <- Valida si estoy pasandome del borde superior
          */ 
  }

  //Asignar que registro guarda que cosa
  
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
      <Opciones mapa={mapa} codigo={codigo} handleMapa={setMapa} setArregloMapa={setArregloMapa}
        setErrorMsg={setErrorMsg} handleCodigo={setCodigo} setIniciar={setIniciar}
        setErroresCodigo={setErrorCodigo} />
       <div className = "bg-dark container my-2 p-5 text-center">
        {(arregloMapa.length != 0) && <Mapa setErrorMsg={setErrorMsg} setDir={setDir} arr={arregloMapa}
        x={sizeX} y={sizeY} objetivoMontado={objetivoMontado}/>}{/*Talvez sea conveniente quitar los setx y sety en un futuro*/}
      </div> 
      <ErrorMsgCodigo errores={errorCodigo}/>
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
