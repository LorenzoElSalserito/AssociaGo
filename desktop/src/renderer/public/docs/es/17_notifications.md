# 17. Notificaciones

El sistema de **Notificaciones** de AssociaGo informa en tiempo real sobre los eventos importantes de la asociación.

## 17.1 Campana de Notificaciones
En el encabezado de la página, junto al perfil del usuario, se encuentra el icono de la **campana**:
- Un **indicador rojo** con el número señala las notificaciones no leídas.
- Al hacer clic en la campana se abre el panel de notificaciones.

## 17.2 Panel de Notificaciones
El panel muestra la lista de notificaciones ordenadas de la más reciente a la más antigua:

Para cada notificación se muestran:
- **Título**: Descripción breve del evento.
- **Mensaje**: Detalle adicional.
- **Fecha y Hora**: Cuándo se generó la notificación.
- **Estado**: Leída (gris) o No leída (resaltada).

### Acciones Disponibles
- **Marcar como leída**: Haz clic en la notificación individual para marcarla como leída.
- **Marcar todas como leídas**: Botón en la parte superior del panel para marcar todas las notificaciones como leídas de una sola vez.

## 17.3 Tipos de Notificación
El sistema genera notificaciones automáticas para diversos eventos:

| Tipo | Descripción |
|------|-------------|
| **INFO** | Información general (ej. "Nuevo socio registrado"). |
| **WARNING** | Avisos que requieren atención (ej. "Carnets a punto de caducar"). |
| **ALERT** | Situaciones urgentes (ej. "Vencimiento fiscal inminente"). |
| **REMINDER** | Recordatorios programados (ej. "Asamblea mañana"). |

## 17.4 Actualización Automática
Las notificaciones se actualizan automáticamente cada **30 segundos** sin necesidad de recargar la página. El indicador en la campana se actualiza en tiempo real.

## 17.5 Notificaciones Vinculadas
Algunas notificaciones están vinculadas a entidades específicas (socio, evento, actividad). El sistema registra el tipo y el ID de la entidad relacionada para facilitar la navegación directa al contexto de la notificación.

> **Nota**: Las notificaciones son generadas automáticamente por el sistema en respuesta a acciones y vencimientos. Actualmente no es posible crear notificaciones manuales.
