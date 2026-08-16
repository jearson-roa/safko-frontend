import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// =====================================================
// PALETA SAFKO
// =====================================================

const COLORS = {
  primario: [36, 27, 166],       // #241BA6
  secundario: [77, 104, 216],    // #4D68D8
  verde: [145, 240, 35],         // #91F023
  naranja: [252, 91, 32],        // #FC5B20

  negro: [25, 25, 25],
  texto: [55, 55, 55],
  gris: [105, 105, 105],
  grisClaro: [235, 237, 244],
  grisFondo: [247, 248, 252],
  blanco: [255, 255, 255],
};

// =====================================================
// UTILIDADES
// =====================================================

const textoSeguro = (valor, fallback = "—") => {
  if (
    valor === null ||
    valor === undefined ||
    String(valor).trim() === ""
  ) {
    return fallback;
  }

  return String(valor);
};

const nombreCompleto = (asistente) => {
  return [
    asistente?.nombres,
    asistente?.apellido_paterno,
    asistente?.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ");
};

const formatearFecha = (fecha) => {
  if (!fecha) return "—";

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return String(fecha);
  }

  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatearFechaHora = (fecha) => {
  if (!fecha) return "—";

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return String(fecha);
  }

  return date.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// =====================================================
// SECCIÓN
// =====================================================

const dibujarSeccion = (doc, titulo, y, marginX, contentWidth) => {
  doc.setFillColor(...COLORS.grisFondo);
  doc.roundedRect(
    marginX,
    y,
    contentWidth,
    8,
    1.5,
    1.5,
    "F"
  );

  doc.setFillColor(...COLORS.primario);
  doc.roundedRect(
    marginX,
    y,
    3,
    8,
    1.5,
    1.5,
    "F"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.primario);

  doc.text(
    titulo.toUpperCase(),
    marginX + 8,
    y + 5.4
  );

  return y + 14;
};

// =====================================================
// CAMPO
// =====================================================

const dibujarCampo = (
  doc,
  label,
  valor,
  x,
  y,
  width
) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.gris);

  doc.text(label.toUpperCase(), x, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.negro);

  const texto = textoSeguro(valor);

  const lineas = doc.splitTextToSize(
    texto,
    width
  );

  doc.text(lineas, x, y + 5);

  return Math.max(1, lineas.length) * 4.5 + 10;
};

// =====================================================
// GENERAR PDF
// =====================================================

export const generarPDFCharla = (charla) => {
  if (!charla) {
    console.error(
      "No se recibió información de la charla."
    );

    return;
  }

  // ===================================================
  // DOCUMENTO CARTA
  // ===================================================

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2;

  let y = 0;

  // ===================================================
  // ENCABEZADO
  // ===================================================

  doc.setFillColor(...COLORS.primario);

  doc.rect(
    0,
    0,
    pageWidth,
    32,
    "F"
  );

  // Línea decorativa
  doc.setFillColor(...COLORS.verde);

  doc.rect(
    0,
    29,
    pageWidth,
    3,
    "F"
  );

  // Marca
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.blanco);

  doc.text(
    "SAFKO",
    marginX,
    12
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  doc.text(
    "REGISTRO DE SEGURIDAD",
    marginX,
    18
  );

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);

  doc.text(
    "CHARLA DIARIA DE SEGURIDAD",
    pageWidth - marginX,
    11,
    { align: "right" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  doc.text(
    "CHARLA DE 5 MINUTOS",
    pageWidth - marginX,
    17,
    { align: "right" }
  );

  // Número de documento
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.text(
    `N° REGISTRO: ${textoSeguro(
      charla.id_charla
    )}`,
    pageWidth - marginX,
    24,
    { align: "right" }
  );

  y = 42;

  // ===================================================
  // INFORMACIÓN PRINCIPAL
  // ===================================================

  y = dibujarSeccion(
    doc,
    "Información de la charla",
    y,
    marginX,
    contentWidth
  );

  // Caja principal

  doc.setDrawColor(...COLORS.grisClaro);
  doc.setFillColor(...COLORS.blanco);

  doc.roundedRect(
    marginX,
    y,
    contentWidth,
    31,
    2,
    2,
    "FD"
  );

  const colWidth =
    contentWidth / 2;

  const x1 = marginX + 6;
  const x2 =
    marginX + colWidth + 4;

  dibujarCampo(
    doc,
    "Tema",
    charla.tema,
    x1,
    y + 8,
    colWidth - 14
  );

  dibujarCampo(
    doc,
    "Fecha de la charla",
    formatearFecha(
      charla.fecha_charla
    ),
    x2,
    y + 8,
    colWidth - 14
  );

  dibujarCampo(
    doc,
    "Trabajo a realizar",
    charla.trabajo_realizar,
    x1,
    y + 21,
    colWidth - 14
  );

  dibujarCampo(
    doc,
    "Ubicación",
    charla.latitud && charla.longitud
      ? `${charla.latitud}, ${charla.longitud}`
      : "Sin ubicación registrada",
    x2,
    y + 21,
    colWidth - 14
  );

  y += 39;

  // ===================================================
  // RIESGOS
  // ===================================================

  y = dibujarSeccion(
    doc,
    "Evaluación de seguridad",
    y,
    marginX,
    contentWidth
  );

  const seguridad = [
    {
      titulo: "Riesgos detectados",
      texto: charla.riesgos_detectados,
    },
    {
      titulo: "Medidas preventivas",
      texto: charla.medidas_preventivas,
    },
  ];

  seguridad.forEach((item) => {
    doc.setDrawColor(...COLORS.grisClaro);
    doc.setFillColor(...COLORS.blanco);

    const texto = textoSeguro(
      item.texto,
      "Sin información registrada."
    );

    const lineas =
      doc.splitTextToSize(
        texto,
        contentWidth - 14
      );

    const alto =
      Math.max(
        18,
        lineas.length * 4.5 + 12
      );

    // Control de página
    if (
      y + alto >
      pageHeight - 25
    ) {
      doc.addPage();
      y = 20;
    }

    doc.roundedRect(
      marginX,
      y,
      contentWidth,
      alto,
      2,
      2,
      "S"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.primario);

    doc.text(
      item.titulo.toUpperCase(),
      marginX + 6,
      y + 7
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.texto);

    doc.text(
      lineas,
      marginX + 6,
      y + 12
    );

    y += alto + 7;
  });

  // ===================================================
  // OBSERVACIONES
  // ===================================================

  const observaciones =
    textoSeguro(
      charla.observaciones,
      "Sin observaciones registradas."
    );

  const obsLineas =
    doc.splitTextToSize(
      observaciones,
      contentWidth - 14
    );

  const obsAlto =
    Math.max(
      20,
      obsLineas.length * 4.5 + 12
    );

  if (
    y + obsAlto >
    pageHeight - 25
  ) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(...COLORS.grisClaro);

  doc.roundedRect(
    marginX,
    y,
    contentWidth,
    obsAlto,
    2,
    2,
    "S"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.primario);

  doc.text(
    "OBSERVACIONES",
    marginX + 6,
    y + 7
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.texto);

  doc.text(
    obsLineas,
    marginX + 6,
    y + 12
  );

  y += obsAlto + 10;

  // ===================================================
  // ASISTENTES
  // ===================================================

  if (
    y + 45 >
    pageHeight - 25
  ) {
    doc.addPage();
    y = 20;
  }

  y = dibujarSeccion(
    doc,
    "Registro de asistentes",
    y,
    marginX,
    contentWidth
  );

  const asistentes = Array.isArray(
    charla.asistentes
  )
    ? charla.asistentes
    : [];

  autoTable(doc, {
    startY: y,

    head: [
      [
        "N°",
        "Nombre completo",
        "RUT",
        "Cargo",
        "Firma",
      ],
    ],

    body:
      asistentes.length > 0
        ? asistentes.map((asistente, index) => [
            index + 1,
            nombreCompleto(
              asistente
            ) || "—",
            textoSeguro(
              asistente.rut
            ),
            textoSeguro(
              asistente.cargo
            ),
            "",
          ])
        : [
            [
              "",
              "No hay asistentes registrados.",
              "",
              "",
              "",
            ],
          ],

    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize: 8,
      textColor: COLORS.texto,
      cellPadding: 3,
      lineColor: COLORS.grisClaro,
      lineWidth: 0.2,
      valign: "middle",
    },

    headStyles: {
      fillColor: COLORS.primario,
      textColor: COLORS.blanco,
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
      cellPadding: 3.5,
    },

    alternateRowStyles: {
      fillColor: [250, 250, 253],
    },

    columnStyles: {
      0: {
        cellWidth: 10,
        halign: "center",
      },

      1: {
        cellWidth: "auto",
      },

      2: {
        cellWidth: 27,
      },

      3: {
        cellWidth: 32,
      },

      4: {
        cellWidth: 32,
        minCellHeight: 14,
      },
    },

    margin: {
      left: marginX,
      right: marginX,
    },

    didDrawPage: () => {
      // Nada adicional.
    },
  });

  y =
    doc.lastAutoTable.finalY + 14;

  // ===================================================
  // DECLARACIÓN
  // ===================================================

  if (
    y + 45 >
    pageHeight - 25
  ) {
    doc.addPage();
    y = 20;
  }

  y = dibujarSeccion(
    doc,
    "Declaración y conformidad",
    y,
    marginX,
    contentWidth
  );

  const declaracion =
    "Se deja constancia de que la presente charla fue realizada " +
    "conforme a la información registrada en este documento. " +
    "Los asistentes declaran haber recibido la información " +
    "relativa a los riesgos identificados y a las medidas " +
    "preventivas indicadas.";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.texto);

  const declaracionLineas =
    doc.splitTextToSize(
      declaracion,
      contentWidth
    );

  doc.text(
    declaracionLineas,
    marginX,
    y
  );

  y +=
    declaracionLineas.length * 4.5 +
    16;

  // ===================================================
  // FIRMAS
  // ===================================================

  const firmaWidth = 70;

  const firmaX1 = marginX + 12;

  const firmaX2 =
    pageWidth -
    marginX -
    12 -
    firmaWidth;

  doc.setDrawColor(
    ...COLORS.gris
  );

  doc.line(
    firmaX1,
    y,
    firmaX1 + firmaWidth,
    y
  );

  doc.line(
    firmaX2,
    y,
    firmaX2 + firmaWidth,
    y
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.negro);

  doc.text(
    "RESPONSABLE DE LA CHARLA",
    firmaX1 + firmaWidth / 2,
    y + 5,
    { align: "center" }
  );

  doc.text(
    "REPRESENTANTE / SUPERVISOR",
    firmaX2 + firmaWidth / 2,
    y + 5,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.gris);

  doc.text(
    "Firma y nombre",
    firmaX1 + firmaWidth / 2,
    y + 10,
    { align: "center" }
  );

  doc.text(
    "Firma y nombre",
    firmaX2 + firmaWidth / 2,
    y + 10,
    { align: "center" }
  );

  // ===================================================
  // PIE DE PÁGINA
  // ===================================================

  const totalPaginas =
    doc.internal.getNumberOfPages();

  for (
    let pagina = 1;
    pagina <= totalPaginas;
    pagina++
  ) {
    doc.setPage(pagina);

    const alto =
      doc.internal.pageSize.getHeight();

    // Línea
    doc.setDrawColor(
      ...COLORS.grisClaro
    );

    doc.line(
      marginX,
      alto - 16,
      pageWidth - marginX,
      alto - 16
    );

    // Identificación
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(
      ...COLORS.gris
    );

    doc.text(
      "SAFKO · Registro de Seguridad",
      marginX,
      alto - 10
    );

    doc.text(
      `Generado: ${formatearFechaHora(
        new Date()
      )}`,
      pageWidth / 2,
      alto - 10,
      { align: "center" }
    );

    doc.text(
      `Página ${pagina} de ${totalPaginas}`,
      pageWidth - marginX,
      alto - 10,
      { align: "right" }
    );
  }

  // ===================================================
  // NOMBRE DEL ARCHIVO
  // ===================================================

  const id =
    charla.id_charla ??
    "sin-id";

  doc.save(
    `Charla_5_Minutos_${id}.pdf`
  );
};