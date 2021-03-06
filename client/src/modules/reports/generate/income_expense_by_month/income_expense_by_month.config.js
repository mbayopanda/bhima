angular.module('bhima.controllers')
  .controller('income_expense_by_monthController', IncomeExpenseByMonthConfigController);

IncomeExpenseByMonthConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state',
];

function IncomeExpenseByMonthConfigController($sce, Notify, SavedReports, AppCache, reportData, $state) {
  const vm = this;
  const cache = new AppCache('configure_income_expense_by_month');
  const reportUrl = 'reports/finance/income_expense_by_month';

  vm.reportDetails = {};
  vm.previewGenerated = false;

  checkCachedConfiguration();

  vm.onSelectFiscal = function onSelectFiscal(fiscal) {
    vm.reportDetails.fiscalYearId = fiscal.id;
  };

  vm.onSelectPeriod = function onSelectPeriod(period) {
    vm.reportDetails.periodId = period.id;
    vm.reportDetails.periodNumber = period.number;
  };

  vm.OnRemoveUnusedAccounts = (val) => {
    vm.reportDetails.removeUnusedAccounts = val;
  };

  vm.preview = function preview(form) {
    if (form.$invalid) { return 0; }
    // update cached configuration
    cache.reportDetails = angular.copy(vm.reportDetails);

    return SavedReports.requestPreview(reportUrl, reportData.id, angular.copy(vm.reportDetails))
      .then((result) => {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.requestSaveAs = function requestSaveAs() {
    const options = {
      url : reportUrl,
      report : reportData,
      reportOptions : angular.copy(vm.reportDetails),
    };

    return SavedReports.saveAsModal(options)
      .then(() => {
        $state.go('reportsBase.reportsArchive', { key : options.report.report_key });
      })
      .catch(Notify.handleError);
  };

  // load cache if defined
  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
  }
}
