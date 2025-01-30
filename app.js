class HorasTrabajoApp {
  constructor() {
    this.registrosDiarios = [];
    this.registrosSemana = {};
    this.inicializarEventListeners();
  }

  inicializarEventListeners() {
    document.getElementById('daily-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.agregarRegistroDiario();
    });
  }

  agregarRegistroDiario() {
    const nombre = document.getElementById('nombre').value;
    const fecha = document.getElementById('fecha').value;
    const horaEntrada = document.getElementById('hora-entrada').value;
    const horaSalida = document.getElementById('hora-salida').value;

    const horasTotales = this.calcularHorasTotales(horaEntrada, horaSalida);
    const cumplimiento = horasTotales >= 3 ? '✓' : '✗';

    const registro = {
      nombre,
      fecha,
      horaEntrada,
      horaSalida,
      horasTotales,
      cumplimiento
    };

    this.registrosDiarios.push(registro);
    this.actualizarTablaDiaria();
    this.actualizarRegistroSemanal(registro);
    this.generarNotificaciones();
    this.actualizarDashboard();
    this.cerrarModalRegistroDiario();
  }

  calcularHorasTotales(horaEntrada, horaSalida) {
    const entrada = new Date(`2023-01-01T${horaEntrada}`);
    const salida = new Date(`2023-01-01T${horaSalida}`);
    const diferencia = (salida - entrada) / (1000 * 60 * 60);
    return Number(diferencia.toFixed(2));
  }

  actualizarTablaDiaria() {
    const tableBody = document.getElementById('daily-table-body');
    tableBody.innerHTML = this.registrosDiarios.map(registro => `
      <tr>
        <td>${registro.nombre}</td>
        <td>${registro.fecha}</td>
        <td>${registro.horaEntrada}</td>
        <td>${registro.horaSalida}</td>
        <td>${registro.horasTotales}</td>
        <td>${registro.cumplimiento}</td>
      </tr>
    `).join('');
  }

  actualizarRegistroSemanal(registro) {
    const diaSemana = new Date(registro.fecha).getDay();
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    if (!this.registrosSemana[registro.nombre]) {
      this.registrosSemana[registro.nombre] = {
        horasPorDia: new Array(7).fill(0),
        totalHoras: 0
      };
    }

    this.registrosSemana[registro.nombre].horasPorDia[diaSemana] = registro.horasTotales;
    this.registrosSemana[registro.nombre].totalHoras = this.registrosSemana[registro.nombre].horasPorDia.reduce((a, b) => a + b, 0);

    this.actualizarTablaRegistroSemanal();
  }

  actualizarTablaRegistroSemanal() {
    const tableBody = document.getElementById('weekly-table-body');
    tableBody.innerHTML = Object.entries(this.registrosSemana).map(([nombre, datos]) => `
      <tr>
        <td>${nombre}</td>
        ${datos.horasPorDia.map(horas => `<td>${horas}</td>`).join('')}
        <td>${datos.totalHoras}</td>
        <td>${datos.totalHoras >= 28 ? '😊' : '☹️'}</td>
      </tr>
    `).join('');
  }

  generarNotificaciones() {
    const listadoIncumplimiento = document.getElementById('non-compliance-list');
    const incumplidores = Object.entries(this.registrosSemana)
      .filter(([nombre, datos]) => datos.totalHoras < 28)
      .map(([nombre]) => nombre);

    listadoIncumplimiento.innerHTML = incumplidores.length > 0 
      ? `<p>Incumplidores: ${incumplidores.join(', ')}</p>` 
      : '<p>Todos han cumplido con las horas semanales</p>';
  }

  actualizarDashboard() {
    this.generarGraficoHorasSemanal();
    this.generarGraficoCumplimiento();
  }

  generarGraficoHorasSemanal() {
    const ctx = document.getElementById('weekly-hours-chart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(this.registrosSemana),
        datasets: [{
          label: 'Horas Trabajadas por Persona',
          data: Object.values(this.registrosSemana).map(datos => datos.totalHoras),
          backgroundColor: 'rgba(75, 192, 192, 0.6)'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Horas'
            }
          }
        }
      }
    });
  }

  generarGraficoCumplimiento() {
    const ctx = document.getElementById('compliance-chart').getContext('2d');
    const cumplimiento = Object.values(this.registrosSemana).reduce((acc, datos) => {
      datos.totalHoras >= 28 ? acc.cumplidos++ : acc.incumplidos++;
      return acc;
    }, {cumplidos: 0, incumplidos: 0});

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Cumplidos', 'Incumplidos'],
        datasets: [{
          data: [cumplimiento.cumplidos, cumplimiento.incumplidos],
          backgroundColor: ['#4CAF50', '#F44336']
        }]
      },
      options: {
        responsive: true
      }
    });
  }
}

function abrirModalRegistroDiario() {
  document.getElementById('daily-modal').style.display = 'block';
}

function cerrarModalRegistroDiario() {
  document.getElementById('daily-modal').style.display = 'none';
  document.getElementById('daily-form').reset();
}

const app = new HorasTrabajoApp();