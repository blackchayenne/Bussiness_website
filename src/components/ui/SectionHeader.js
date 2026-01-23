export default function SectionHeader({
  label,
  title,
  description,
  align = 'left',
  dark = false
}) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
  }

  return (
    <div className={`max-w-3xl ${alignClasses[align]}`}>
      {label && (
        <p className={`text-xs font-medium tracking-widest uppercase mb-4 ${
          dark ? 'text-stone-400' : 'text-stone-500'
        }`}>
          {label}
        </p>
      )}
      <h2 className={`font-display text-display-sm md:text-display ${
        dark ? 'text-white' : 'text-stone-900'
      }`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-6 text-lg leading-relaxed ${
          dark ? 'text-stone-300' : 'text-stone-600'
        }`}>
          {description}
        </p>
      )}
    </div>
  )
}
