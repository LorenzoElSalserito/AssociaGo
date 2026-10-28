# 6. Gestión de Asambleas

Abre **Asambleas** desde el grupo **Gobernanza** del menú lateral. Aquí registras las asambleas de socios, las asistencias y las mociones, y descargas el acta.

## 6.1 Lista de asambleas

Para cada asamblea la tabla muestra:
- título y tipo;
- fecha y hora;
- quórum de primera convocatoria (en porcentaje);
- estado.

**Buscar asambleas...** filtra por título. Haz clic en una fila o en **Ver detalles** para abrir la ficha; las demás acciones son **Editar** y **Eliminar**.

## 6.2 Crear una asamblea

Pulsa **Nueva Asamblea** y rellena:
- **Título** (obligatorio) y **Descripción**.
- **Fecha** (obligatoria, con la hora), **Hora de Inicio** y **Hora de Fin**.
- **Ubicación**.
- **Tipo**: Ordinaria o Extraordinaria.
- **Estado**: Borrador, Convocada, En Curso, Cerrada o Cancelada. El estado se cambia a mano, editando la asamblea.
- **Presidente** y **Secretario**: texto libre, no vinculado a la lista de socios.
- **Quórum primera convocatoria (%)** y **Quórum segunda convocatoria (%)**: valores predeterminados 50 y 33.
- **Notas**.

Pulsa **Crear** (o **Actualizar** al editar).

## 6.3 Ficha de detalle

Arriba encuentras los botones **Acta** y **Editar** y cuatro indicadores:
- **Estado**;
- **Presente**: participantes registrados como presentes;
- **Delegación**: participantes registrados por delegación;
- **Quórum**: **Alcanzado** o **No Alcanzado**.

El quórum se calcula sumando presentes y delegaciones y comparándolo con el número de socios activos. Se alcanza si el porcentaje llega al umbral de primera convocatoria o al de segunda: en la práctica basta el umbral más bajo.

Debajo hay tres pestañas.

### Participantes
Pulsa **Registrar Presencia** e indica:
- **Seleccionar Socio** (obligatorio);
- **Tipo de Participación**: Presente, Delegación o Ausente;
- **Rol**: Socio, Presidente, Secretario o Escrutador;
- **Apoderado**: solo aparece con el tipo Delegación; elige el socio que recibe la delegación;
- **Notas**.

La hora de registro se guarda automáticamente. La tabla muestra el nombre del socio, el tipo de participación, el rol y el apoderado. Con **Editar** (icono de lápiz) cambias socio, tipo, rol, apoderado y notas; con **Eliminar** quitas el registro.

> Presentes y delegaciones determinan el quórum y el número máximo de votos que se pueden registrar en cada moción: actualiza las asistencias antes de registrar los votos.

### Mociones
Pulsa **Añadir Moción** y rellena:
- **Título** (obligatorio) y **Descripción**;
- **Tipo de votación**: Mayoría Simple, Mayoría Cualificada, Unanimidad o Consultivo;
- **Número de Orden**;
- **Planificado (en la agenda)**;
- **Notas**.

Pulsa **Guardar Moción**. La tabla, ordenada por número de orden, muestra el tipo de votación, los votos y el **Resultado**. Las acciones son **Registrar votación**, **Editar** (todos los campos de la moción) y **Eliminar**.

**Registrar votación** abre una ventana con **A favor**, **En contra** y **Abstenciones**. Mientras escribes ves los votos emitidos respecto a los votantes con derecho (presentes + delegaciones) y el resultado calculado. Los números deben ser enteros no negativos y el total no puede superar presentes más delegaciones; sin presentes ni delegaciones la votación no se registra. Pulsa **Guardar votación**; **Anular votación** devuelve la moción a **Pendiente**.

El programa calcula el resultado según el tipo de votación:
- **Mayoría Simple**: aprobada si los votos a favor superan a los votos en contra (en caso de empate se rechaza);
- **Mayoría Cualificada**: aprobada con al menos 2/3 a favor de los votos emitidos, abstenciones incluidas;
- **Unanimidad**: aprobada si nadie vota en contra y al menos uno vota a favor;
- **Consultivo**: ningún resultado vinculante, la moción queda como **Tomada en cuenta**.

Si cambias el tipo de votación de una moción ya votada, el resultado se recalcula con los votos registrados.

### Documentos
Pulsa **Añadir Documento** e indica **Nombre del Documento** (obligatorio), **Tipo de documento** (Acta, Convocatoria, Adjunto, Balance), **Descripción** y **Documento Obligatorio**.

> El campo **Archivo** está desactivado: la subida de archivos todavía no está disponible, así que solo se registra el nombre del documento.

## 6.4 Acta

**Acta** descarga un PDF A4, en el idioma de la interfaz, con:
- título, tipo, fecha, lugar, presidente y secretario de la asamblea;
- quórum de primera y segunda convocatoria y si se ha alcanzado;
- nombres de los presentes y de los participantes por delegación, con quién ha recibido la delegación;
- para cada moción, en orden: tipo de votación, votos a favor, en contra y abstenciones, resultado (Aprobada, Rechazada, Tomada en consideración o Pendiente de votación) y posible acuerdo;
- las firmas del presidente y del secretario.

Las mociones largas continúan en las páginas siguientes. Para las firmas vale lo descrito en el capítulo 16: la imagen de **Ajustes › Firmas** solo aparece si el nombre indicado en la asamblea coincide con el de la firma guardada; si no, queda la línea vacía para firmar a mano.
