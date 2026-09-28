from rest_framework.routers import DefaultRouter

from .views import AnaliticaView, DocumentoViewSet, ModalidadViewSet, PostulacionViewSet, UsuarioViewSet

router = DefaultRouter()
router.register("usuarios", UsuarioViewSet, basename="usuario")
router.register("modalidades", ModalidadViewSet, basename="modalidad")
router.register("postulaciones", PostulacionViewSet, basename="postulacion")
router.register("documentos", DocumentoViewSet, basename="documento")
router.register("analitica", AnaliticaView, basename="analitica")

urlpatterns = router.urls
