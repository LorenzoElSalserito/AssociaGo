# 4. Gestión de Eventos

La página **Eventos y Cupones** contiene dos pestañas: **Eventos** (fiestas, reuniones, recaudaciones de fondos, conferencias) y **Cupones** (consulta el capítulo 9).

## 4.1 Lista de eventos

Para cada evento la tabla muestra:
- título;
- fecha;
- lugar;
- estado.

**Buscar eventos...** filtra la lista. En cada fila están las acciones **Ver detalles**, **Editar** y **Eliminar**.

## 4.2 Crear un evento

Pulsa **Añadir Evento** y rellena:
- **Nombre del Evento** y **Tipo**, ambos obligatorios. Los tipos son Reunión / Asamblea, Fiesta, Recaudación de fondos, Congreso, Conferencia, Otro.
- **Estado**: Planificado, Confirmado, En Curso, Completado o Cancelada. Los eventos cancelados no aparecen entre los próximos eventos del Tablero.
- **Fecha de Inicio** (obligatoria), **Hora de Inicio**, **Fecha de Fin**, **Hora de Fin**.
- **Ubicación**, **Dirección** y **Descripción**.
- **Costo Socios** y **Costo No Socios**.
- **Máx. Participantes**. Si lo dejas vacío, las plazas son ilimitadas.
- Las opciones **Evento público**, **Requiere Inscripción** y **Generar Factura**.

## 4.3 Ficha de detalle

### Indicadores
- **Registrado**: número de inscritos, excluidos los cancelados y la lista de espera.
- **Presente**: número de participantes que han registrado la entrada.
- **Tasa de Asistencia**: presentes divididos entre inscritos.
- **Ingresos**: suma de los pagos registrados; para quien está marcado como Pagado sin importe registrado cuenta la cuota debida, ya descontada.

### Participantes
**Añadir Participante** ofrece dos **tipos de participante**:
- **Socio**: se elige de la lista de socios.
- **Invitado (Externo)**: se indican nombre y correo.

La cuota debida es el **Costo Socios** para los socios y el **Costo No Socios** para los invitados. El campo opcional **Código de cupón** aplica un descuento (consulta 9.3); la tabla muestra la cuota debida y, si se ha usado, el cupón con el descuento.

Para cada participante la tabla muestra estado, asistencia y pago, con la acción para quitarlo. El campo **Buscar participante por nombre o email** filtra las filas: útil en la entrada con listas largas.

En cada fila:
- **Registrar entrada**: marca al participante como presente y registra la hora de llegada, que se muestra debajo del botón. El botón pasa a **Presente**; púlsalo de nuevo para deshacer la entrada. Quien tiene la inscripción cancelada no puede registrar la entrada.
- **Estado del pago**: en el menú de la fila elige Pendiente, Pagado, Exento o Reembolsado. El cambio se guarda al instante.

Tras cada acción los indicadores de arriba se actualizan.

### Certificados
Elige una plantilla y pulsa **Emisión masiva**: cada participante inscrito como socio recibe un certificado. Los invitados externos no reciben certificados nominativos.

### Importación CSV
Aquí importas los participantes desde un archivo CSV. El flujo (vista previa y luego confirmación) es el mismo que en las actividades: consulta el capítulo 3.
