# Coin Craze

Coin Craze es un prototipo de juego web casual diseñado para experimentar con mecánicas
rápidas, compartir desafíos virales y validar integraciones de monetización (tienda de
microtransacciones y recompensas por anuncios).

## Características

- Mecánica de juego «haz clic en las monedas» con combos de puntuación y aparición dinámica de monedas.
- Temporizador de 60 segundos con barra de progreso y récord local persistente.
- Tienda ficticia con botones listos para conectar a un backend de pagos.
- Zona patrocinada para integrar redes de anuncios recompensados.
- Diálogo para compartir el reto, copiar el mensaje y fomentar el crecimiento viral.
- Notificaciones en pantalla para recompensas, récords y acciones clave.

## Ejecutar localmente

No se requiere un servidor web específico. Puedes abrir `index.html` directamente en tu
navegador o servir la carpeta con cualquier servidor estático.

```bash
# ejemplo con Python 3
python -m http.server 8000
# visita http://localhost:8000
```

## Próximos pasos sugeridos

1. Conectar la tienda a tu pasarela de pago (Stripe, PayPal, Mercado Pago, etc.).
2. Añadir autenticación y tablas de clasificación alojadas en tu backend.
3. Integrar un servicio de anuncios recompensados real.
4. Publicar desafíos periódicos en redes sociales para impulsar la viralidad.
