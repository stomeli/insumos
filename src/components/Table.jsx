function Table({
  columns,
  data,
  emptyMessage = "Nenhum registro encontrado.",
  renderActions,
}) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                {column.label}
              </th>
            ))}

            {renderActions && <th>Ações</th>}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={
                  columns.length +
                  (renderActions ? 1 : 0)
                }
                className="table-empty"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id ?? index}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render
                      ? column.render(item)
                      : item[column.key] ?? "-"}
                  </td>
                ))}

                {renderActions && (
                  <td className="table-actions">
                    {renderActions(item)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
