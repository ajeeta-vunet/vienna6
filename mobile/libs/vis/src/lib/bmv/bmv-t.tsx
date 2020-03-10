import { Metric } from '@vu/types';
import React from 'react';
import { BMV_MAX_ROWS } from './config';
import { Link } from 'react-router-dom';

type TableCell = { value: string; color: string } | string;
type Row = { columns: TableCell[]; data: { [key: string]: Metric } };
type Rows = Row[];
export type TableData = { header: TableCell[]; bucketLevel: number; rows: Rows };

export function BucketTable(props: { table: TableData; full: boolean; linkTo: string }) {
  const { table, full, linkTo } = props;
  const sliceTo = table.rows.length > BMV_MAX_ROWS && !full ? BMV_MAX_ROWS - 1 : table.rows.length;
  return (
    <div className="table-responsive">
      <table className="table mb-0">
        <thead>
          <tr>
            {table.header.map((a, i) => (
              <th key={i}>
                <b>{a}</b>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.slice(0, sliceTo).map((a, i) => (
            <tr key={i}>
              {a.columns.map((b, i) =>
                typeof b === 'string' ? (
                  <td key={i}>{b}</td>
                ) : (
                  <td key={i} style={{ color: b.color }}>
                    {b.value}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
        {table.rows.length > BMV_MAX_ROWS && !full ? (
          <tfoot>
            <tr>
              <td className="text-center text-link" colSpan={100}>
                <Link to={linkTo} className="card-v4 text-link">
                  Readmore
                </Link>
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
