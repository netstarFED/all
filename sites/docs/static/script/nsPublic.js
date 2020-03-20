
            var nsPublic = nsPublic ? nsPublic : {};
            nsPublic.getAppendContainer = function () {
                var insertLocation = $('container:not(.hidden)').not('.content');
                if ($('.nswindow .content').length > 0) {
                    insertLocation = $('.nswindow .content:last');
                }
                return insertLocation;
            }