import CourierFetchRequestRequestProvider from 'ui/courier/fetch/request/request';

define(function (require) {
  return function CourierFetchIsRequestProvider(Private) {
    var AbstractRequest = Private(CourierFetchRequestRequestProvider);

    return function isRequest(obj) {
      return obj instanceof AbstractRequest;
    };
  };
});
