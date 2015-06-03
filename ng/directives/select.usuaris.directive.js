angular.module('appLearn').directive('select2', function() {
    return {
        restrict: 'E',

        template: '<select id="select2" class="js-data-example-ajax">  <option value="3620194" selected="selected">Usuari</option></select>',
        link: function(scope, element) {

            $(".js-data-example-ajax").select2({
                ajax: {
                    url: "/api/users/lletra",
                    dataType: 'json',
                    delay: 250,
                    data: function(params) {
                        return {
                            id: params.term,
                            page: params.page
                        };
                    },
                    processResults: function(data, page) {
                       
                        return {
                            results: data
                        };
                    },
                    cache: true
                },
                escapeMarkup: function(markup) {
                    return markup;
                }, // let our custom formatter work
                minimumInputLength: 1,
                templateResult: formatRepo, // omitted for brevity, see the source of this page
                templateSelection: formatRepoSelection // omitted for brevity, see the source of this page
            });

            function formatRepo(repo) {
               
                if (repo.loading) return repo.text;
                
                var markup = '<div class="clearfix">' +
                    '<a style="cursor:pointer" id="' + repo._id +'"onclick="busca(this.id)">' + repo.username + '</a>' +
                    '</div>';

                if (repo.description) {
                    markup += '<div>' + repo.description + '</div>';
                }

                markup += '</div></div>';

                return markup;
            }

            function formatRepoSelection(repo) {
                return repo.full_name || repo.text;
            }
            
            window.busca = function(e) {
                
                if(scope.currentUser&&e==scope.currentUser._id){
                  scope.PerfilUser();
                }else{
                scope.definirUserVista(e);
                }
                
            }
        }
    }
});