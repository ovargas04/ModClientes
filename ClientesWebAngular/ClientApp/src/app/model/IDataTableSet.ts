export interface IDataTableSet {
  sProcessing: string;
  sLengthMenu: string;
  sZeroRecords: string;
  sEmptyTable: string;
  sInfo: string;
  sInfoEmpty: string;
  sInfoFiltered: string;
  sInfoPostFix: string;
  sSearch: string;
  sUrl: string;
  sInfoThousands: string;
  sLoadingRecords: string;
  oPaginate: {
    sFirst: string,
    sLast: string,
    sNext: string,
    sPrevious: string,
  };
  oAria: {
    sSortAscending: string,
    sSortDescending: string,
  };
  buttons: {
    copy: string,
    colvis: string,
  };
}
