
'use strict';

const excel = require('./lib/excel');
module.exports = {
  buildExport: function(params) {
    if( ! (params instanceof Array)) throw 'buildExport expects an array';

    let sheets = [];
    params.forEach(function(sheet, index) {
      let specification = sheet.specification;
      let dataset = sheet.data;
      let sheet_name = sheet.name || 'Sheet' + index+1;
      let data = [];
      let config = {
        cols: []
      };

      if( ! specification || ! dataset) throw 'missing specification or dataset.';

      if(sheet.heading) {
        sheet.heading.forEach(function(row) {
          data.push(row);
        });
      }

      //build the header row
      let header = [];
      for (let col in specification) {
        header.push({
          value: specification[col].displayName,
          style: (specification[col].headerStyle) ? specification[col].headerStyle : undefined
        });

        if(specification[col].width) {
          if(Number.isInteger(specification[col].width)) config.cols.push({wpx: specification[col].width});
          else if(Number.isInteger(parseInt(specification[col].width))) config.cols.push({wch: specification[col].width});
          else throw 'Provide column width as a number';
        } else {
          config.cols.push({});
        }

      }
      data.push(header); //Inject the header at 0

      dataset.forEach(record => {
        let row = [];
        for (let col in specification) {
          let cell_value = record[specification[col].id];

          if(specification[col].cellFormat && typeof specification[col].cellFormat == 'function') {
            cell_value = specification[col].cellFormat(record[specification[col].id], record);
          }

          if(specification[col].cellStyle && typeof specification[col].cellStyle == 'function') {
            cell_value = {
              value: cell_value,
              style: specification[col].cellStyle(record[specification[col].id], record)
            };
          } else if(specification[col].cellStyle) {
            cell_value = {
              value: cell_value,
              style: specification[col].cellStyle
            };
          }
          
          if (specification[col].mergeGroup) {
                cell_value.merge = specification[col].mergeGroup;
          }
          
          row.push(cell_value); // Push new cell to the row
        }
        data.push(row); // Push new row to the sheet
      });

      sheets.push({
        name: sheet_name,
        data: data,
        config: config
      });

    });

    return excel.build(sheets);

  }
}
