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
      <div className= "form-inline well">
        {!props.playing && !props.codigoFinalizado && <div className="fileUpload btn btn-primary">
          <span>Cargar Mapa</span>
          <input type="file" class="upload" id='fileMapa' onChange={(e) => handleSubmit(e)}/>
        </div>}
        {(props.mapa != "") && !props.playing && !props.codigoFinalizado &&
          <div className="fileUpload btn btn-primary">
            <span>Cargar Codigo</span>
            <input type="file" className="upload" id='fileCodigo' onChange={(e) => handleSubmit(e)}/>
          </div>
        }
        {(props.matriz.length > 0) && !props.codigoFinalizado &&
          <button type="button" className={props.iniciar ? "btn btn-danger" :"btn btn-success"} 
          onClick={() => {props.setIniciar(!props.iniciar)}}
          >{props.iniciar ? "Pausar" : "Iniciar"}</button>
        }
        {(props.iniciar) && !props.codigoFinalizado &&
        <select className="form-select tiempos input-sm" value={props.delay} style={{width: 'auto'}}
           onChange={(e) => {props.setDelay(e.target.value)}}>
          <option value="0.2">0.2 Segundos</option>
          <option value="0.5">0.5 Segundos</option>
          <option value="1">1 Segundo</option>
          <option value="2">2 Segundos</option>
          <option value="3">3 Segundos</option>
          <option value="5">5 Segundos</option>
        </select>
        }
        {
          ((props.iniciar) || props.codigoFinalizado) &&
          <button type="button" className="btn btn-danger" onClick={(e) => {window.location.reload()}}>
            Reiniciar
          </button>
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
        return 'robotLeft' + cargando;// + cargando;
      case 'v':
      case 'V':
          props.setDir(270);
          return 'robotDown' + cargando;
      //AGREGAR UNO AL CONTADOR
      case 'O':
      case 'o':
        return 'objetivo';
        //SI EL ANTERIOR ERA C | c ENTONCES DISMINUYE UNO AL OTRO CONTADOR
      case 'D':
      case 'd':
        return 'destino';
        //AGREGAR UNO AL OTRO CONTADOR
      case 'C':
      case 'c':
        return 'objetivodestino';
      default:
        props.setErrorMsg("El archivo contiene caracteres desconoidos, Favor revise el archivo seleccionado.");
        break;
    }
  }

  return (
    <div className="tablero p-3 rounded" id="tablero">
      {arregloX.map((vacio, x) => (
        <div key={vacio}>
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

function Registros(props) {
  return (
    <table class="table table-striped">
      <tbody >
        <th class="table_title ">Registros</th>
        <th class="table_title">valor</th>
        {props.registros.map((data, i) => (
          <tr class="table_registro" key={i}>
            <th class="table_registro">{data[0]}</th>
            <td class="table_registro">{data[1]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

//comando actual, log, pila, sensor direccion 
function Datos(props) {
  return (
    <table class="table table-striped">
      <tbody >
        <th class="table_title">Dato</th>{/* TITULO DE LA TABLA */}
        <th class="table_title">Valor</th>
        <tr class="table_registro">
          <th class="table_registro">Comando Actual</th>
          <td class="table_registro">{props.comandoAct}</td> {/* EL VALOR DEL TITULO */}
        </tr>
        <tr class="table_registro">
          <th class="table_registro">Log</th>
          <td class="table_registro">{props.log}</td> {/* EL VALOR DEL TITULO */}
        </tr>
        {props.pila.length != 0 && 
          <tr class="table_registro">
          <th class="table_registro">Pila</th>
          <td class="table_registro">{props.pila[props.pila.length - 1]}</td>
        </tr>}
        <tr>
          <th class="table_registro">Sensor Direccion</th>
          <td class="table_registro">{props.dir}</td>
        </tr>
        <tr>
          <th class="table_registro">Sensor Posicion X</th>
          <td class="table_registro">{props.posX}</td>
        </tr>
        <tr>
          <th class="table_registro">Sensor Posicion Y</th>
          <td class="table_registro">{props.posY}</td>
        </tr>
      </tbody>
    </table>
  );
}


function App() {
  var error = "";
  let matrizTeemporal = [];
  let matrizRegistro = [];
  //Mapa y Codigo
  const [errorCodigo, setErrorCodigo] = useState("");
  const [mapa, setMapa] = useState("");
  const [arregloMapa, setArregloMapa] = useState("");
  const [codigo, setCodigo] = useState("");
  const [sizeX, setSizeX]  = useState(0);
  const [sizeY, setSizeY]  = useState(0);
  const fil = useRef(0);
  const col = useRef(0);
  const [matriz, setMatriz] = useState([]);

  //Robot
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [dir, setDir] = useState(0);
  const moves = useRef(0);
  const [objetivoMontado, setObjetivoMontado] = useState(false);

  //Simulacion
  const [errorMsg, setErrorMsg] = useState("");
  const [delay, setDelay] = useState(1);
  const [iniciar, setIniciar] = useState(false);
  const boxes = useRef(0);
  const delivered = useRef(0);
  const [codigoFinalizado, setCodigoFinalizado] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [matrizRegistros, setMatrizRegistros] = useState([]);
  const [comandoAct, setComandoAct] = useState("");
  const [stack, setStack] = useState([]);
  const matrizRe = useRef([]);
  const [logTxt, setLog] = useState("");

  useEffect(() => {//codigo
    codigoMatriz(codigo);
    const matriztmp = [];
    for (let i = 0; i < 16; i++) {
      var arregloTemp = []
      var registro = i + "R";
      arregloTemp.push(registro);
      arregloTemp.push(0);
      matriztmp.push(arregloTemp);
    }
    matrizRe.current = matriztmp;
    setMatrizRegistros(matriztmp);
    setLog("");
  }, [codigo]);

  useEffect(() => {
    setIniciar(false);
  }, [codigoFinalizado])

  useEffect(() => {
    if (iniciar) {
      setPlaying(true);
    }
  }, [iniciar])

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

  useEffect(() => {//mapa
    setArregloMapa([]);
    boxes.current = 0;
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
      const boxtmp = [];
      setArregloMapa(arr.slice(1, arr.length));
      for (let i = 0; i < x; i++) {
        for (let j = 0; j < y; j++) {
          if (arr[i].charAt(j) == 'o' || arr[i].charAt(j) == 'O') {
            boxtmp.push("");
          }
        }
      }
      boxes.current = boxtmp.length;
    } catch (error) {
      setErrorMsg("Ocurrio un error leyendo el archivo");
    }
    
  }, [mapa]);

  useInterval(() => {
    if (moves.current > 0) {
      if(enfrente("rgb(84, 94, 105)")){
        let pos = 0;
        moves.current = moves.current - 1;
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
        moves.current = 0;
        setErrorMsg('EL ROBOT QUISO SALIRSE DE LOS LIMITES FISICOS');
        setCodigoFinalizado(true);
      }
    } else {
      var comandoActual = "";
      var Registros = "";
      let z = 0;
      try {
        comandoActual = matriz[fil.current][col.current];
        setComandoAct(comandoActual);
        ejecutarComando(comandoActual);
        Registros = "";
        for (var i = 0; i < 16; i++) {
          Registros += "[" + matrizRe.current[i][1] + "]";
        }
        if (fil.current == matriz.length - 1 && col.current == matriz[fila].length)
          return;
      } catch (error) {
      }
      function ejecutarComando(comando) {
        var terminoJump = false;
        const palabras = comando.split(" ");
        switch (palabras[0]) {
          case "avz":
            let pos = 0;
              let numero = convertirNumero(palabras[1]);
              let dirtmp = dir;
            if(convertirNumero(palabras[1]) < 0){
              if(detras("rgb(84, 94, 105)")){
                if (dirtmp == 0) {
                  handleArregloMapaUpdate(posX, posY, '-', posX, posY - 1, '>', numero);
                } else if (dirtmp == 90) {
                  handleArregloMapaUpdate(posX, posY, '-', posX + 1, posY, '^', numero);
                } else if (dirtmp == 180) {
                  handleArregloMapaUpdate(posX, posY, '-', posX, posY + 1, '<', numero);
                } else if (dirtmp == 270 /*&& enfrente("rgb(84, 94, 105))*/) {
                  handleArregloMapaUpdate(posX, posY, '-', posX - 1, posY, 'v', numero);
                }
                setDir(dirtmp);
                numero *= -1;
                moves.current = 0;
              }
            }else if(enfrente("rgb(84, 94, 105)") && convertirNumero(palabras[1]) > 0){
              if(numero != 0 ){
                if (dirtmp == 0) {
                  handleArregloMapaUpdate(posX, posY, '-', posX, posY + 1, '>', numero);
                } else if (dirtmp == 90) {
                  handleArregloMapaUpdate(posX, posY, '-', posX - 1, posY, '^', numero);
                } else if (dirtmp == 180) {
                  handleArregloMapaUpdate(posX, posY, '-', posX, posY - 1, '<', numero);
                } else if (dirtmp == 270 /*&& enfrente("rgb(84, 94, 105))*/) {
                  handleArregloMapaUpdate(posX, posY, '-', posX + 1, posY, 'v', numero);
                }
                if (numero > 1) {
                  moves.current = numero - 1;
                } else {
                  moves.current = 0;
                }
              }
            }  else {
              moves.current = 0;
              //BUG
              setErrorMsg('EL ROBOT QUISO SALIRSE DE LOS LIMITES FISICOS');
              setCodigoFinalizado(true);
              // EL ROBOT QUISO SALIRSE DE LOS LIMITES FISICOS
            }
            break;

          case "rtr":
            const idActual = posX * sizeY + posY;
            const robot = document.getElementById(idActual);
            let direccion = 0;
            document.getElementById(idActual + 1);
            if (dir == 0 && palabras[1] == '-90') {
              direccion = 270;
              setDir(270);
            } else if (dir == 270 && palabras[1] == '+90') {
              direccion = 0;
              setDir(0);
            } else {
              direccion = dir + parseInt(palabras[1]);
              setDir(direccion);
            }
            let chr = '';
            switch (direccion) {
              case 0:
                chr = '>';
                break;
              case 90:
                chr = '^';
                break;
              case 180:
                chr = '<';
                break;
              case 270:
                chr = 'v';
                break;
            }
            handleArregloMapaUpdate(posX,posY,chr);
            break;

          case "crg":
            let char = '';
            const obj = objetivoMontado;
            if (palabras[1] == 0) {
              if (obj == 1) {
                if(enfrente("rgb(84, 94, 105)") || enfrente("rgb(83, 255, 49)")) {
                  setObjetivoMontado(0);
                  if (enfrente("rgb(84, 94, 105)")) {
                    char = 'o';
                  } else if (enfrente("rgb(83, 255, 49)")) {
                    char = 'c';
                    delivered.current = delivered.current + 1;
                  } else {
                    //EL ROBOT QUISO DESCARGAR LA CAJA EN UNA ZONA NO PERMISIBLE
                    setErrorMsg('EL ROBOT QUISO DESCARGAR LA CAJA EN UNA ZONA NO PERMISIBLE');
                    setCodigoFinalizado(true);
                  }
                  if (dir == 0) {
                    handleArregloMapaUpdate(posX, posY + 1, char);
                  } else if (dir == 90) {
                    handleArregloMapaUpdate(posX - 1, posY, char);
                  } else if (dir == 180) {
                    handleArregloMapaUpdate(posX , posY - 1, char);
                  } else if (dir == 270) {
                    handleArregloMapaUpdate(posX + 1, posY, char);
                  }
                }
              } else {
                setErrorMsg('EL ROBOT QUISO DESCARGAR SIN TENER UNA CAJA');
                setCodigoFinalizado(true);
              }
            } else {
              if (obj == 0 && (enfrente("rgb(221, 255, 31)") || enfrente("rgb(216, 25, 72)"))) {
                if(enfrente("rgb(216, 25, 72)")){
                  char = 'd';
                  delivered.current = delivered.current - 1;
                } else {
                  char = '-'; 
                }  //DISMINUYE
                if (dir == 0) {
                  handleArregloMapaUpdate(posX, posY + 1, char);
                } else if (dir == 90) {
                  handleArregloMapaUpdate(posX - 1, posY, char);
                } else if (dir == 180) {
                  handleArregloMapaUpdate(posX , posY - 1, char);
                } else if (dir == 270 /*&& enfrente("rgb(84, 94, 105))*/) {
                  handleArregloMapaUpdate(posX + 1, posY, char);
                }
                setObjetivoMontado(1);
              } else if (obj == 1) {
                setErrorMsg('EL ROBOT QUISO CARGAR MAS DE UNA CAJA');
                setCodigoFinalizado(true);
              }
            }
            break;

          case "push":
            if (esNumero(palabras[1]))
              stackPush(palabras[1]);
            else {
              let idRegistro = palabras[1].split("R")[0];
              stackPush(matrizRe.current[idRegistro][1]);
            }
            break;

          case "pop":
            if(stack.length > 0 ){
              let idRPop = palabras[1].split("R")[0];
              matrizRe.current[idRPop][1] = stackPop();
            }else{
              setErrorMsg('NO SE PUEDE HACER POP EN UNA PILA VACÍA');
              setCodigoFinalizado(true);
            }
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
              matrizRe.current[8][1] = 0;
            else
              matrizRe.current[8][1] = 1;
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

          case "div": //15R
            var num1, num2;
            num1 = convertirNumero(palabras[1]);
            num2 = convertirNumero(palabras[2]);
            const idRDiv = palabras[3].split("R")[0];
            if(num2 == 0 ){
              setErrorMsg('LA DIVISIÓN DE UN NÚMERO ENTRE CERO ES INDEFINIDO');
              setCodigoFinalizado(true);
            }else{
              matrizRe.current[idRDiv][1] = parseInt(parseInt(num1) / parseInt(num2));
              matrizRe.current[15][1] = (parseInt(num1) % parseInt(num2));
            }
            break;

          case "cmp": //Registro 12R
            var num1, num2;
            num1 = convertirNumero(palabras[1]);
            num2 = convertirNumero(palabras[2]);
            if (num1 == num2)
              matrizRe.current[12][1] = 0;
            else if (num1 > num2)
              matrizRe.current[12][1] = 1;
            else if (num1 < num2)
              matrizRe.current[12][1] = -1;
            if (num1 >= num2)
              matrizRe.current[13][1] = 2;
            if (num1 <= num2)
              matrizRe.current[11][1] = -2;
            break;

          case "and": //Registro 10R
            var num1, num2;
            num1 = convertirNumero(palabras[1]);
            num2 = convertirNumero(palabras[2]);
            if (num1 != 0 && num2 != 0)
              matrizRe.current[10][1] = 1;
            else
              matrizRe.current[10][1] = 0;
            break;

          case "or": //Registro 9R
            var num1, num2;
            num1 = convertirNumero(palabras[1]);
            num2 = convertirNumero(palabras[2]);
            if (num1 != 0 || num2 != 0)
              matrizRe.current[9][1] = 1;
            else
              matrizRe.current[9][1] = 0;
            break;

          case "jmp":
            jumpEtiqueta(palabras[1]);
            break;

          case "jmle": //Registro 11R
            if (matrizRe.current[11][1] == -2)
              jumpEtiqueta(palabras[1]);
            else
              terminoJump = true;
            break;

          case "jml": //Registro 12R
            if (matrizRe.current[12][1] == -1)
              jumpEtiqueta(palabras[1]);
            else
              terminoJump = true;
            break;

          case "jme": //Registro 12R
            if (matrizRe.current[12][1] == 0)
              jumpEtiqueta(palabras[1]);
            else
              terminoJump = true;
            break;

          case "jmh": //Registro 12R
            if (matrizRe.current[12][1] == 1)
              jumpEtiqueta(palabras[1]);
            else
              terminoJump = true;
            break;

          case "jmhe": //Registro 13R
            if (matrizRe.current[13][1] == 2)
              jumpEtiqueta(palabras[1]);
            else
              terminoJump = true;
            break;

          case "log":
            let mensajeLog = palabras[1] + " " +convertirNumero(palabras[2]);
            setLog(mensajeLog);
            break;
        }
        
        if (!esJump(comando) || terminoJump) {
          if (col.current == matriz[fil.current].length - 1) {
            fila++;
            fil.current = fil.current + 1;
            columna = 0;
            col.current = 0;
          } else {
            columna++;
            col.current = col.current + 1;
          }
        }
        if( fil.current == matriz.length ){
          if(delivered.current != boxes.current){
            setErrorMsg('El Programa Ha Sido Un Fallo');
            setCodigoFinalizado(true);
            setPlaying(false);
          }else{
            setErrorMsg(' El Programa Ha Sido Un Exito');
            setIniciar(false);
            setCodigoFinalizado(true);
            setPlaying(false);
          }
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
    const currTmp = [...matrizRe.current]
    setMatrizRegistros(currTmp);
  }, iniciar ? delay * 1000 : null);
  

  function handleArregloMapaUpdate(lineaOld, indexOld, charReplace, lineaNew = lineaOld,
     indexNew = indexOld, charNew = charReplace, rmoves = 0) {
    function setCharAt(str,index,chr) {
      let string = "";
      for (let i = 0; i < str.length; i++) {
        if (i == index) {
          string += chr;
        } else {
          string += str.charAt(i);
        } 
      }
      return string;
  }
    const arr = [...arregloMapa];
    arr[lineaOld] = setCharAt(arr[lineaOld], indexOld,charReplace);
    arr[lineaNew] = setCharAt(arr[lineaNew], indexNew,charNew);
    if (moves.current != 0) {
      moves.current = rmoves;
    }
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
          if(palabras[1] == '+90' || palabras[1] == '-90')
            return true;
          error = "El parametro del comando 'rtr' solo puede ser +90 o -90";
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
        }else if( palabras[0] == "snsdf" || palabras[0] == "snsm" || palabras[0] == "snso" || palabras[0] == "snsd" || palabras[0] == "snsom" ){
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
        }else if(palabras[0] == "log"){
          if(esNumeroRegistro(palabras[2]))
            return true;
            error = "Los parametros deben ser PALABRA  REGISTRO/NUMERO";
        }
      }else if(palabras.length == 4){
        if( palabras[0] == "sum" || palabras[0] == "rst" || palabras[0] == "mul" || palabras[0] == "div"){
          if(esNumeroRegistro(palabras[1]) && esNumeroRegistro(palabras[2]) && esRegistro(palabras[3]))
            return true;
          error = "Los parametros deben ser REGISTRO/NUMERO   REGISTRO/NUMERO REGISTRO";
        }
      }else{
        error = "Cantidad invalida de parametros";
      }
      return false;
    }
    return true;
  }

  function codigoMatriz(codigoTxt) {
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
      lineas[i] = lineas[i].split("#")[0];
      lineas[i] += " ";
      var aux = [], acum = "";
      for(var h = 0; h < lineas[i].length; h++){
        if(lineas[i][h] != " " && lineas[i] != '\t'){
          acum += lineas[i][h];
        }
        if( (lineas[i][h] == " " || lineas[i][h] == '\t') && acum != ""){
          aux.push(acum);
          acum = "";
        }
      }
      do{
        var h = aux.indexOf('\t');
        if ( h !== -1 ) {
          aux.splice( h, 1 );
        }
      }while(h !== -1);
      lineas[i] = "";
      for(var h = 0; h < aux.length; h++){
        lineas[i] += aux[h];
        if(h < aux.length-1)
          lineas[i] += " ";
      }
      if( lineas[i].split(" ").length == 1 && lineas[i].charAt(lineas[i].length-1) == ':' ){
        if(arreglo.length > 0)
          matrizTeemporal.push(arreglo);
        arreglo = [];
        let et = lineas[i].substring(0, lineas[i].length - 1);
        if(existeEtiqueta(et)){
          errores += "Error en la linea: " + (i+1) + "\n" +lineas[i] + "\nEtiqueta repetida\n\n";
        }else 
          arreglo.push(et);
        
      }
      if(lineas[i][0] != '#' && lineas[i].split(" ").length > 1 ){
        arreglo.push(lineas[i]);
        if( !comandoValido(lineas[i]) )
          errores += "Error en la linea: " + (i+1) + "\n" +lineas[i] + "\n" + error + "\n\n";
        if(esJump(lineas[i]))
          jumps.push(lineas[i] + "%" + (i+1));
      }
      if(lineas[i].split(" ").length == 1 && lineas[i].charAt(lineas[i].length-1) != ':' && codigoTxt.length > 1 && lineas[i].split(" ")[0].length > 0){
        errores += "Error en la linea: " + (i+1) + "\n" +lineas[i] + "\n Porción de código invalido \n\n";
      }
    }
    if(arreglo.length > 0)
      matrizTeemporal.push(arreglo);
    for(var i = 0; i < jumps.length; i++ ) {
      if(!jumpValido(jumps[i])){
        const jmp = jumps[i].split(" ")[0] + " " + jumps[i].split(" ")[1].split("%")[0];
        errores += "Error en la linea: " + jumps[i].split(" ")[1].split("%")[1] + "\n" + jmp + "\n" + error + "\n\n";
      }
    }
    if (errores != "") {
      setErrorMsg("Error en su archivo de codigo, revise abajo para más información.")
      setErrorCodigo(errores); 
    } else {
      setMatriz(matrizTeemporal);
    }
  }
  
  function convertirNumero(parametro) {
    if(esRegistro(parametro)){
      const idR1 = parametro.split("R")[0];
      return matrizRe.current[idR1][1];
    }else
      return parametro;
      
  }

  var fila = 0, columna = 0, comandoActual = "";

  function enfrente(parametro) {
    let siguienteCasilla = -1;
    let idActual = posX * sizeY + posY;
    if(dir == 0){
      if( (idActual % sizeY ) != (sizeY - 1) )
        siguienteCasilla = document.getElementById(parseInt(idActual) + 1);
    }else if(dir == 90){
      if( (idActual - sizeY) >= 0)
        siguienteCasilla = document.getElementById(parseInt(idActual) - parseInt(sizeY));
    }else if(dir == 180){
      if( idActual % sizeY != 0 )
        siguienteCasilla = document.getElementById(parseInt(idActual) - 1);
    }else if(dir == 270){
      if( (parseInt(idActual, 10) + parseInt(sizeY, 10)) <= sizeY * sizeX) {
        siguienteCasilla = document.getElementById(parseInt(idActual) + parseInt(sizeY));
      }
    }
    if( siguienteCasilla == -1){
      return false;
    }else
      if(window.getComputedStyle(siguienteCasilla).backgroundColor  == parametro) {
        return true;
      } else {
        return false;
      }
  }

  function detras(parametro) {
    let siguienteCasilla = -1;
    let idActual = posX * sizeY + posY;
    if(dir == 0){
      if( (parseInt(idActual, 10) + parseInt(sizeY, 10)) <= sizeY * sizeX)
        siguienteCasilla = document.getElementById(parseInt(idActual) - 1);
    }else if(dir == 90){
      if( idActual % sizeY != 0 )
        siguienteCasilla = document.getElementById(parseInt(idActual) + parseInt(sizeY));
    }else if(dir == 180){
      if( (idActual - sizeY) >= 0)
        siguienteCasilla = document.getElementById(parseInt(idActual) + 1);
    }else if(dir == 270){
      if( (idActual % sizeY ) != (sizeY - 1) ) {
        siguienteCasilla = document.getElementById(parseInt(idActual) - parseInt(sizeY));
      }
    }
    if( siguienteCasilla == -1){
      return false;
    }else
      if(window.getComputedStyle(siguienteCasilla).backgroundColor  == parametro) {
        return true;
      } else {
        return false;
      }
  }
  
  return (
    <div>
      {errorMsg &&
        <div className={((errorMsg.charAt(0) == ' ') ? "alert alert-success" : "alert alert-danger") + " alert-dismissible fade show"} role="alert">
          <strong>{errorMsg}</strong>
          <button type="button" class="btn-close" data-dismiss="alert" onClick={(e) => (setErrorMsg(""))}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      }
      <nav className="navbar-light bg-light">
        <Opciones mapa={mapa} codigo={codigo} handleMapa={setMapa} setArregloMapa={setArregloMapa} 
        codigoFinalizado={codigoFinalizado} setErrorMsg={setErrorMsg} handleCodigo={setCodigo}
        setIniciar={setIniciar} iniciar={iniciar} setErroresCodigo={setErrorCodigo}
        setDelay={setDelay} matriz = {matriz} delay={delay} playing={playing}/>
      </nav>
      <div className="fondo p-5 text-center">
        {(arregloMapa.length != 0) &&
            <div className="row">
              <div className ="col-md-10">
                {/* ROW */}
                <div className="row">
                  <Mapa setErrorMsg={setErrorMsg} setDir={setDir} arr={arregloMapa}
                    x={sizeX} y={sizeY} objetivoMontado={objetivoMontado} boxes ={boxes} />
                </div>
                {/* ROW */}
                <div className = "row">
                  <Datos pila={stack} log={logTxt} comandoAct={comandoAct}
                  dir={dir} posX={posX} posY={posY}/>
                </div>
              </div>
              <div className="col-md-2">
                <Registros registros={matrizRegistros}/>
              </div>
            </div>
          }

      </div>
      <ErrorMsgCodigo errores={errorCodigo} />
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
