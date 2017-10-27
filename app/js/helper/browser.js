angular.module('wriggle').factory(
    'BrowserHelper', function (
        $log
    ) {
        const userAgent = navigator.userAgent;

        const BrowserHelper = {
            // @formatter:off
            isChrome:  userAgent.toLowerCase().indexOf('chrome')  > -1,
            isEdge:    userAgent.toLowerCase().indexOf('edge')    > -1,
            isFirefox: userAgent.toLowerCase().indexOf('firefox') > -1,
            isSafari:  userAgent.toLowerCase().indexOf('safari')  > -1
            // @formatter:on
        };

        BrowserHelper.init = function () {
            var classToAdd = null;

            if (BrowserHelper.isSafari && !BrowserHelper.isChrome) {
                classToAdd = 'is-safari';
            }

            if (classToAdd) {
                $('body').addClass(classToAdd);
            }
        };

        BrowserHelper.init();

        return BrowserHelper;
    }
);