# 8. Gestión de Voluntarios

Abre **Voluntarios** desde el grupo **Personas** del menú lateral. Aquí vinculas a los socios con el rol de voluntario, registras los turnos y gestionas los reembolsos de gastos.

## 8.1 Lista de voluntarios

Para cada voluntario la tabla muestra:
- nombre y correo del socio;
- habilidades;
- horas;
- estado.

**Buscar voluntarios...** filtra por nombre. Las acciones de cada fila son **Ver detalles**, **Editar** y **Eliminar**.

La columna **Horas** suma las **Horas Trabajadas** de todos los turnos del voluntario; **Estado** indica Activo o Inactivo.

## 8.2 Añadir un voluntario

Pulsa **Añadir Voluntario** y rellena:
- **Socio** (obligatorio): elige el socio en **Seleccionar un miembro...**;
- **Habilidades**: texto libre, p. ej. Primeros auxilios, Logística, Comunicación;
- **Disponibilidad**: texto libre, p. ej. Fines de semana, Tardes;
- **Estado**: Activo o Inactivo;
- **Notas**.

Pulsa **Crear** (o **Actualizar** al editar).

> Al editar, el socio vinculado no cambia: para asociar otro socio crea un voluntario nuevo.

## 8.3 Ficha de detalle

El encabezado muestra **Voluntario** con su número y el **ID de Socio**, además del botón **Editar**. Tres recuadros indican **Estado**, **Habilidades** y **Disponibilidad**. Debajo hay dos pestañas.

### Turnos
Pulsa **Añadir Turno** y rellena:
- **Hora de Inicio** y **Hora de Fin** (fecha y hora, obligatorias);
- **Rol**;
- **Evento (Opcional)** o **Actividad (Opcional)**, para vincular el turno;
- **Horas Trabajadas** y **Valor por Hora (€)**;
- **Estado**: Programado, Completado o Perdido;
- **Descripción / Notas**.

Pulsa **Guardar Turno**. La tabla muestra inicio, fin, rol, horas y estado; el icono de edición vuelve a abrir el turno.

> Las horas trabajadas no se calculan a partir de los horarios: introdúcelas tú. El valor por hora se guarda, pero no se usa en ningún resumen. Al editar solo se actualizan horarios, rol, horas y estado; evento, actividad, valor por hora y notas se quedan como al principio. Los turnos no se pueden eliminar.

### Gastos (reembolsos)
Pulsa **Añadir gasto** e indica **Fecha**, **Descripción** e **Importe (€)**, todos obligatorios, y después **Guardar gasto**. El gasto empieza pendiente de aprobación.

Las acciones dependen del estado del gasto:
- pendiente: **Aprobar** o **Rechazar**;
- aprobado: **Marcar como Pagado**.

Cuando marcas un gasto como pagado, AssociaGo registra automáticamente un gasto en Finanzas, con la fecha de hoy y la categoría Reimbursement, a nombre de la asociación con la que has iniciado sesión.

> Los gastos no se pueden editar ni eliminar, y no se adjuntan recibos.
