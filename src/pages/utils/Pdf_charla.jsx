import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ---- Paleta de colores (ajústala a la identidad de tu empresa) ----
const COLOR_PRIMARIO = [21, 61, 92];      // Azul corporativo (encabezado)
const COLOR_SECUNDARIO = [230, 240, 247]; // Azul muy claro (fondos de sección)
const COLOR_TEXTO = [40, 40, 40];
const COLOR_GRIS = [120, 120, 120];

export const generarPDFCharla = (charla) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  let y = 0;

  // ============ ENCABEZADO ============
  doc.setFillColor(...COLOR_PRIMARIO);
  doc.rect(0, 0, pageWidth, 32, "F");

  // Logo (opcional): descomenta y ajusta si tienes el logo en base64
  // doc.addImage(logoBase64, "PNG", marginX, 6, 20, 20);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CHARLA DIARIA DE SEGURIDAD", marginX, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `N° Registro: ${charla.numero_ot ?? "-"}`,
    marginX,
    24
  );

  const fechaTexto = charla.fecha_charla
    ? new Date(charla.fecha_charla).toLocaleString("es-CL")
    : "-";
  doc.text(fechaTexto, pageWidth - marginX, 24, { align: "right" });

  y = 42;

  // ============ SECCIÓN: DATOS GENERALES ============
  doc.setFillColor(...COLOR_SECUNDARIO);
  doc.rect(marginX, y, pageWidth - marginX * 2, 7, "F");
  doc.setTextColor(...COLOR_PRIMARIO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("DATOS GENERALES", marginX + 2, y + 5);
  y += 13;

  const campoAncho = (pageWidth - marginX * 2) / 2;

  const campos = [
    ["Trabajo a realizar", charla.trabajo_realizar],
    ["Tema", charla.tema],
    ["Latitud", charla.latitud],
    ["Longitud", charla.longitud],
  ];

  doc.setFontSize(9);
  campos.forEach(([label, valor], i) => {
    const col = i % 2;
    const fila = Math.floor(i / 2);
    const x = marginX + col * campoAncho;
    const yy = y + fila * 14;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLOR_GRIS);
    doc.text(label.toUpperCase(), x, yy);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLOR_TEXTO);
    doc.text(String(valor ?? "-"), x, yy + 5, {
      maxWidth: campoAncho - 6,
    });
  });

  y += Math.ceil(campos.length / 2) * 14 + 6;

  // ============ SECCIÓN: RIESGOS Y MEDIDAS ============
  const bloques = [
    ["Riesgos detectados", charla.riesgos_detectados],
    ["Medidas preventivas", charla.medidas_preventivas],
    ["Observaciones", charla.observaciones],
  ];

  bloques.forEach(([titulo, texto]) => {
    doc.setFillColor(...COLOR_SECUNDARIO);
    doc.rect(marginX, y, pageWidth - marginX * 2, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_PRIMARIO);
    doc.text(titulo.toUpperCase(), marginX + 2, y + 4.2);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLOR_TEXTO);
    const lineas = doc.splitTextToSize(String(texto ?? "-"), pageWidth - marginX * 2 - 4);
    doc.text(lineas, marginX + 2, y);
    y += lineas.length * 5 + 8;
  });

  // ============ TABLA DE ASISTENTES ============
  doc.setFillColor(...COLOR_SECUNDARIO);
  doc.rect(marginX, y, pageWidth - marginX * 2, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_PRIMARIO);
  doc.text("REGISTRO DE ASISTENTES", marginX + 2, y + 5);
  y += 11;

  autoTable(doc, {
    startY: y,
    head: [["N°", "Nombre completo", "RUT", "Cargo", "Firma"]],
    body: charla.asistentes.map((a, i) => [
      i + 1,
      `${a.nombres} ${a.apellido_paterno} ${a.apellido_materno}`,
      a.rut,
      a.cargo,
      "", // espacio para firma
    ]),
    styles: {
      fontSize: 8.5,
      textColor: COLOR_TEXTO,
      cellPadding: 3,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: COLOR_PRIMARIO,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 28 },
      3: { cellWidth: 32 },
      4: { cellWidth: 28 },
    },
    margin: { left: marginX, right: marginX },
  });

  // ============ PIE DE PÁGINA (todas las páginas) ============
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(220, 220, 220);
    doc.line(marginX, pageHeight - 15, pageWidth - marginX, pageHeight - 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_GRIS);
    doc.text(
      `Generado el ${new Date().toLocaleString("es-CL")}`,
      marginX,
      pageHeight - 9
    );
    doc.text(
      `Página ${i} de ${totalPaginas}`,
      pageWidth - marginX,
      pageHeight - 9,
      { align: "right" }
    );
  }

  doc.save(`Charla_${charla.id_charla}.pdf`);
};