const Footer = ({ columns = [] }) => {
  return (
    <footer className="mt-20 bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 md:grid-cols-4 lg:px-8">
        {columns.map((column, columnIndex) => (
          <div key={`${column.heading}-${columnIndex}`}>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {column.heading}
            </h4>
            <ul className="space-y-2 text-sm">
              {column.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>
                  <a href="#" className="transition hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>© 2026 Peltown, Inc. All rights reserved.</p>
          <p>Learn. Build. Grow.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
