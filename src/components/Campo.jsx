import './Campo.css'

// Campo de formulario reutilizable: etiqueta + control + mensaje de error.
// - Por defecto renderiza un <input>; las props extra (type, autoComplete, min,
//   step, placeholder...) se le pasan al input con {...resto}.
// - Para un control distinto (ej: <select>) se pasa como children; en ese caso el
//   hijo debe tener el mismo id para que el <label htmlFor> siga apuntando bien.
// - errores es opcional: las pantallas sin validacion por campo (Login) no lo pasan.
const Campo = ({ id, label, form, errores = {}, cambiar, children, ...resto }) => (
  <div className={errores[id] ? 'campo campo--error' : 'campo'}>
    <label htmlFor={id}>{label}</label>
    {children ?? (
      <input id={id} name={id} value={form[id]} onChange={cambiar} {...resto} />
    )}
    {errores[id] && <span className="campo__error">{errores[id]}</span>}
  </div>
)

export default Campo
