import React, { useState, useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import './style.css';
import { Grid, Typography, Table, TableHead, TableBody, TableRow, TableCell, Button } from '@mui/material';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
const ITEMS_PER_PAGE = 100; // Número de elementos por página

const Prueba = () => {
  //ASIGNAR VARIABLES
  const [cantidad, setCantidad] = useState(10);
  const [intervalos, setIntervalos] = useState(10);
  const [distribucion, setDistribucion] = useState('Normal');
  const [numerosGenerados, setNumerosGenerados] = useState([]);
  const [datosAgrupados, setDatosAgrupados] = useState([]);

  const [a,setA] = useState(8);
  const [b,setB] = useState(14);
  const [media,setMedia] = useState(1);
  const [desvEstandar,setDesviacionEstandar] = useState(1);
  const [mediaNormal,setMediaNormal] = useState(1);

  const [currentPage, setCurrentPage] = useState(1);
  const chartRef = useRef();
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartInstanceRef.current) {
      const ctx = chartRef.current.getContext('2d');
      chartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Números Aleatorios',
              backgroundColor: 'blue',
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 1,
              hoverBackgroundColor: 'rgba(75,192,192,0.6)',
              hoverBorderColor: 'rgba(75,192,192,1)',
              data: [],
            },
          ],
        },
      });
    }
  }, []);

  //----------------------------PAGINADO--------------------------------------
  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const totalPages = Math.ceil(numerosGenerados.length / ITEMS_PER_PAGE);

  const paginatedNumeros = numerosGenerados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  //--------------------------------------------------------------------------

  const generarNumerosRandom = () => {
    let nuevosNumeros = [];

    // Generar números según la distribución seleccionada
    switch (distribucion) {
      case 'Normal':
        nuevosNumeros = generarNumerosDistribucionNormal(cantidad);
        break;
      case 'Exponencial':
        nuevosNumeros = generarNumerosDistribucionExponencial(cantidad,media);
        break;
      case 'Uniforme':
        nuevosNumeros = generarNumerosDistribucionUniforme(cantidad,a,b);
        break;
      default:
        break;
    }

    //-----------------Calcular el valor mínimo y máximo de los números generados-------------------
    let minNumero = Infinity;
    let maxNumero = -Infinity;
    
    for (const numero of nuevosNumeros) {
      if (numero < minNumero) {
        minNumero = numero;
      }
      if (numero > maxNumero) {
        maxNumero = numero;
      }
    }
    //----------------------------------------------------------------------------------------------

    // Calcular el intervaloANcho basado en el valor mínimo, máximo y la cantidad de intervalos
    const intervaloAncho = (maxNumero - minNumero) / intervalos;

    // Generar los datos agrupados utilizando los nuevos intervalos
    const datosAgrupados = generarDatosAgrupados(nuevosNumeros, minNumero, intervaloAncho, intervalos, distribucion);

    // Actualizar datos del gráfico
    const labels = datosAgrupados.map(({ desde, hasta }) => {
      return `${desde.toFixed(2)} a ${hasta.toFixed(2)}`;
    });
    chartInstanceRef.current.data.labels = labels;
    chartInstanceRef.current.data.datasets[0].data = datosAgrupados.map((item) => item.cantidad);
    chartInstanceRef.current.options.scales.x = {
      type: 'category',
      labels: labels,
      display: true,
    };
    chartInstanceRef.current.update();

    // Actualizar números generados para mostrar en la tabla
    setNumerosGenerados(nuevosNumeros.map((numero, index) => ({ id: index + 1, numero })));
  };

  const generarDatosAgrupados = (numeros, minNumero, intervaloAncho, intervalos, distribucion) => {
    let minValor = minNumero;
    const datosAgrupados = new Array(intervalos).fill(0).map((_, index) => {
      const desde = minValor;
      const hasta = minValor + intervaloAncho;
      const cantidad = numeros.filter((numero) => numero >= desde && numero < hasta).length;
      let frecEsperada = 0;
  
      if (distribucion === 'Uniforme') {
        frecEsperada = numeros.length / intervalos;
      } else if (distribucion === 'Normal') {
        frecEsperada = 0;
      }
  
      minValor += intervaloAncho; // Actualiza el valor mínimo para el próximo intervalo
      return { desde, hasta, cantidad, frecEsperada };
    });
    console.log(datosAgrupados);
  
    setDatosAgrupados(datosAgrupados);
    return datosAgrupados;
  };  

  const generarNumerosDistribucionNormal = (cantidad) => {
    const nuevosNumeros = [];
    for (let i = 0; i < cantidad; i++) {
      // Generar números aleatorios con distribución normal utilizando la función modificarGenerarNumeroNormal()
      const numero = modificarGenerarNumeroNormal(desvEstandar,mediaNormal);
      nuevosNumeros.push(numero);
    }
    return nuevosNumeros;
  };

  const modificarGenerarNumeroNormal = (desvEstandar,mediaNormal) => {
    // Generar un número normal utilizando el método de Box-Muller
    let u1 = Math.random();
    let u2 = Math.random();
    let z0 = (Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)) * desvEstandar + mediaNormal;
    return z0;
  };

  //Ver bien como es la formula de la media y lambda
  const generarNumerosDistribucionExponencial = (cantidad, media) => {
    const nuevosNumeros = [];
    for (let i = 0; i < cantidad; i++) {
      // VER COMO CAMBIAR DESPUES EL VALOR DE LAMBDA
      const u = Math.random();
      const x = -media * Math.log(1 - u);
      nuevosNumeros.push(x);
    }
    return nuevosNumeros;
  };

  const generarNumerosDistribucionUniforme = (cantidad,a,b) => {
    const nuevosNumeros = [];
    for (let i = 0; i < cantidad; i++) {
      // Generar números aleatorios con distribución uniforme (0 a 1)
      const u = a + Math.random() * (b-a);
      nuevosNumeros.push(u);
    }
    return nuevosNumeros;
  };

  //ACA HACEMOS LOS CAMPOS PARA CARGAR DATOS
  const renderCampos = () => {
    if (distribucion === 'Uniforme') {
      return (
        <div className='filatexto'>
          <TextField style={{ marginLeft: '15px' }} id="filled-basic" label="Numero A" variant="filled" type="number" value={a} onChange={(e) => setA(parseInt(e.target.value))} />
          <TextField style={{ marginLeft: '15px' }} id="filled-basic" label="Numero B" variant="filled" type="number" value={b} onChange={(e) => setB(parseInt(e.target.value))} />
        </div>
      );
    } else if (distribucion === 'Normal') {
      return (
        <div className='filatexto'>
          <TextField style={{marginLeft:'15px'}} id="filled-basic" label="Desviacion estandar" variant="filled" type="number" value={desvEstandar} onChange={(e) => setDesviacionEstandar(parseFloat(e.target.value))}/>
          <TextField style={{marginLeft:'15px'}} id="filled-basic" label="Media" variant="filled" type="number" value={mediaNormal} onChange={(e) => setMediaNormal(parseFloat(e.target.value))}/>
        </div>
      );
    } else if (distribucion === 'Exponencial') {
      return (
        <div className='filatexto'>
          <TextField style={{marginLeft:'15px'}} id="filled-basic" label="Media" variant="filled" type="number" value={media} onChange={(e) => setMedia(parseFloat(e.target.value))}/>
        </div>
      );
    }
    return null;
  };

  //PANTALLA
  return (
    <div>
      <h2 style={{textAlign:'center'}}>TP2 SIM</h2>

      <div className='botonesprimero'>
          <TextField style={{marginLeft:'15px'}} id="filled-basic" label="Numeros" variant="filled" type="number" value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value))}/>
          <TextField style={{marginLeft:'15px'}} id="filled-basic" label="Intervalos" variant="filled" type="number" value={intervalos} onChange={(e) => setIntervalos(parseInt(e.target.value))}/>
          <Select style={{marginLeft:'15px'}} value={distribucion} onChange={(e) => setDistribucion(e.target.value)}>
            <MenuItem value="Normal">Normal</MenuItem >
            <MenuItem value="Exponencial">Exponencial</MenuItem >
            <MenuItem value="Uniforme">Uniforme</MenuItem >
          </Select>
          {renderCampos()}
        <Button style={{marginLeft:'15px'}} variant="contained" onClick={generarNumerosRandom}>Generar Gráfico</Button>
      </div>
      
      <Grid style={{marginTop:'15px'}} className='fila1' container spacing={2}>

        <Grid className='histograma' item xs={5}>
          <div className='grafico'>
            <canvas ref={chartRef} width="400" height="300" />
          </div>
        </Grid>

        <Grid className='tabladenumeros' item xs={5} style={{display:'flex', flexDirection:'column', justifyContent:'flex-start', boxShadow:'5px 5px 10px rgba(0, 0, 0, 0.3)'}}>
          <Typography className='nombrenumero' variant="h5" style={{marginBottom:'10px'}}>Números Generados</Typography>

          <div style={{maxHeight: '350px', overflowY: 'auto'}}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{fontWeight:'bold', color:'white'}} className="table-header" align='center'>ID</TableCell>
                  <TableCell style={{fontWeight:'bold', color:'white'}} className="table-header" align='center'>Número</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedNumeros.map(({ id, numero }) => (
                  <TableRow key={id}>
                    <TableCell align='center'>{id}</TableCell>
                    <TableCell align='center'>{numero.toFixed(4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
                  
          {/* Paginado de los numeros random */}
          <Grid className='botonera'>
            <Button variant="contained" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
              Anterior
            </Button>
            <Typography variant="caption">Página {currentPage} de {totalPages}</Typography>
            <Button variant="contained" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage * ITEMS_PER_PAGE >= numerosGenerados.length}>
              Siguiente
            </Button>
          </Grid>

        </Grid>

      </Grid>

      <Grid style={{marginTop:'19px'}}>
        <div className='fila2'>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{fontWeight:'bold', color:'white'}} align="center" className="table-header">Intervalos</TableCell>
                <TableCell style={{fontWeight:'bold', color:'white'}} align="center" className="table-header">Desde</TableCell>
                <TableCell style={{fontWeight:'bold', color:'white'}} align="center" className="table-header">Hasta</TableCell>
                <TableCell style={{fontWeight:'bold', color:'white'}} align="center" className="table-header">Frecuencia Observada</TableCell>
                <TableCell style={{fontWeight:'bold', color:'white'}} align="center" className="table-header">Frecuencia Esperada</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datosAgrupados.map((dato, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{index + 1}</TableCell>                  
                  <TableCell align="center">{dato.desde.toFixed(2)}</TableCell>
                  <TableCell align="center">{dato.hasta.toFixed(2)}</TableCell>
                  <TableCell align="center">{dato.cantidad}</TableCell>
                  <TableCell align="center">{dato.frecEsperada}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Grid>

    </div>
  );
};

export default Prueba;