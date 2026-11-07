export type Guide = {
  slug: string;
  title: string;
  dek: string;
  minutes: number;
  sections: { h: string; p: string[] }[];
};

export const GUIDES: Guide[] = [
  {
    slug: "leer-el-recibo",
    title: "Cómo leer el recibo sin que te mareen los porcentajes",
    dek: "Jubilación, PAMI y obra social no son lo mismo, y el neto no es el bruto menos un número redondo.",
    minutes: 4,
    sections: [
      {
        h: "El bruto no es lo que llega",
        p: [
          "El sueldo bruto es la base antes de descuentos. Sobre esa base (con un tope que se actualiza) el empleador retiene aportes del trabajador. Lo que ves en la cuenta es el neto: bruto menos esos aportes, más conceptos que a veces no aportan, menos otros descuentos del convenio.",
          "En la práctica más común el trabajador aporta 11% a la jubilación (SIPA), 3% al INSSJP (PAMI) y 3% a la obra social. Son 17 puntos. Sobre un bruto de $1.000.000, eso son $170.000, si no te pasaste de la base imponible máxima.",
        ],
      },
      {
        h: "Qué no sale de tu bolsillo",
        p: [
          "Las contribuciones patronales las paga la empresa encima del bruto. Según la actividad y el tamaño, andan cerca del 18% o del 20,40%. No te las descuentan, pero importan si estás comparando un sueldo con facturar por tu cuenta: el freelance no tiene a nadie poniendo esa parte.",
          "La cuota sindical, si estás afiliado, es otro descuento. No es ley nacional fija: depende del gremio. En Caja Clara podés prenderla y poner el porcentaje de tu recibo.",
        ],
      },
      {
        h: "Lo que esta cuenta no hace",
        p: [
          "No calcula Impuesto a las Ganancias. Si tu recibo tiene retención de cuarta categoría, el neto real es menor. Tampoco reemplaza asignaciones familiares, embargos ni descuentos de préstamos. Usala para entender el esquema y comparar ofertas, y contrastala con el recibo.",
        ],
      },
    ],
  },
  {
    slug: "cuanto-cobrar",
    title: "Cuánto cobrar por hora si facturás solo",
    dek: "El sueldo en mano de un empleado no es tu tarifa. Tenés que cubrir la cuota, los meses flojos y las horas que no se facturan.",
    minutes: 5,
    sections: [
      {
        h: "Empezá por el número que querés en el banco",
        p: [
          "Elegí un neto mensual que te cierre, no una tarifa porque «suena profesional». A eso sumale lo que sí o sí sale: monotributo, herramientas, internet, contador. Ese total es lo que tus horas facturables tienen que rendir.",
        ],
      },
      {
        h: "No todas las horas se cobran",
        p: [
          "Si trabajás 40 horas pero 10 se van en mails, presupuestos y arreglar lo que se rompió, facturás 30. Cobrar las 40 es la forma más común de terminar ganando menos que en relación de dependencia. La calculadora de tarifa parte las horas útiles, no el reloj.",
          "Después mirá la cuota del monotributo de tu categoría. Una categoría baja con facturación alta no es un ahorro: es un problema con ARCA. La tabla de octubre 2026 está en la calculadora de monotributo.",
        ],
      },
      {
        h: "El presupuesto es el momento de cobrar",
        p: [
          "Una tarifa en la cabeza no entra a Mercado Pago. Un presupuesto con ítems, plazo y total sí. Por eso Caja Clara tiene la hoja de presupuesto: la misma cuenta, escrita para el cliente.",
        ],
      },
    ],
  },
  {
    slug: "alquiler-y-sueldo",
    title: "Qué parte del sueldo se te va en el alquiler",
    dek: "El 30% es una regla vieja, no una ley. Igual sirve para ver si el próximo aumento te deja sin resto.",
    minutes: 3,
    sections: [
      {
        h: "Medilo contra el neto, no contra el bruto",
        p: [
          "El contrato habla de un monto. Tu vida habla del dinero que llega. Si comparás el alquiler con el bruto, el porcentaje miente para abajo. Cargá el neto de la calculadora de sueldo y el alquiler actual.",
        ],
      },
      {
        h: "El aumento no es solo este mes",
        p: [
          "Un 8% trimestral no se siente igual que un 8% mensual. La calculadora de inflación muestra cuánta plata vas a necesitar para pagar lo mismo dentro de seis o doce meses. Si el alquiler se ajusta por un índice y tu sueldo no, el porcentaje del sueldo sube aunque no te mudes.",
          "Por debajo del 25–30% del neto suele haber aire. Arriba del 40% el resto (comida, transporte, salud) queda apretado en casi cualquier ciudad. No es un veredicto: es una alarma para mirar el número antes de firmar.",
        ],
      },
    ],
  },
  {
    slug: "aguinaldo-sac",
    title: "Cómo se arma el aguinaldo y qué te retienen",
    dek: "El SAC es la mitad de la mejor remuneración del semestre. El neto no es esa mitad sin más.",
    minutes: 5,
    sections: [
      {
        h: "Qué semestre cuenta",
        p: [
          "El sueldo anual complementario se paga en dos mitades. La de junio mira lo cobrado de enero a junio. La de diciembre, de julio a diciembre. La base es la mayor remuneración mensual devengada en ese semestre, y el aguinaldo bruto es la mitad de esa cifra.",
          "Si trabajaste el semestre completo, no hay prorrateo. Si entraste a mitad de semestre, la mitad se multiplica por los días trabajados sobre los días del semestre. Un mes incompleto no se redondea a un aguinaldo entero.",
        ],
      },
      {
        h: "El recibo de aguinaldo también tiene aportes",
        p: [
          "Sobre el SAC bruto se retienen los mismos aportes del trabajador que sobre un sueldo: 11% de jubilación, 3% de PAMI y 3% de obra social, siempre dentro de la base imponible. Por eso el depósito es menor que «la mejor remuneración dividida dos».",
          "La calculadora de aguinaldo de Caja Clara hace esa cuenta y deja el detalle. Si tu convenio suma un plus que no entra en la mejor remuneración, o si el empleador ya te adelantó una parte, el recibo manda.",
        ],
      },
      {
        h: "Para qué sirve mirarlo antes",
        p: [
          "El aguinaldo suele tapar un alquiler, una deuda o las vacaciones. Si lo contás como un sueldo extra sin los aportes, el plan queda corto. Cargá la mejor remuneración del semestre, no el sueldo de este mes si hubo un retroactivo más alto.",
        ],
      },
    ],
  },
  {
    slug: "leer-el-ipc",
    title: "Cómo leer el IPC sin confundirlo con tu alquiler",
    dek: "El índice nacional es un promedio. Tu canasta y el ajuste de tu contrato pueden ir a otro ritmo.",
    minutes: 6,
    sections: [
      {
        h: "Índice y variación no son lo mismo",
        p: [
          "El IPC nivel general es un número índice. Con la base de diciembre de 2016, ese mes vale 100. Si el índice pasa de 100 a 102, los precios que mide el INDEC subieron 2% en el mes. La variación mensual es esa cuenta: (índice de este mes − índice del mes anterior) / índice del mes anterior.",
          "En Caja Clara esa serie se lee de la publicación oficial. La calculadora de inflación muestra los últimos meses y deja que proyectes un monto con el ritmo que elijas. El último dato publicado no es una promesa del mes que viene.",
        ],
      },
      {
        h: "Por qué tu gasto no copia el índice",
        p: [
          "El IPC nacional pondera una canasta de hogares urbanos de todo el país. Si tu gasto fuerte es el alquiler y el contrato se ajusta por otro índice, o si comprás en un barrio que se movió distinto, tu mes no tiene por qué dar el mismo porcentaje.",
          "Tampoco alcanza con mirar un mes aislado. Doce variaciones chicas, una detrás de la otra, componen un año bastante más alto que la suma simple. Por eso la proyección usa interés compuesto: cada mes el aumento se aplica sobre el monto ya aumentado.",
        ],
      },
      {
        h: "Qué hacer con el número",
        p: [
          "Usalo para tres preguntas concretas. ¿Cuánto tendría que subir un sueldo congelado para comprar lo mismo dentro de seis meses? ¿El próximo ajuste del alquiler se parece al IPC o lo pasa? ¿El presupuesto que pasaste hace un trimestre sigue cubriendo los insumos?",
          "La fuente es el INDEC. Caja Clara no inventa el índice ni lo suaviza. Si el mes todavía no está publicado, la tabla llega hasta el último período disponible.",
        ],
      },
    ],
  },
  {
    slug: "monotributo-en-la-practica",
    title: "Qué mira el monotributo además de la cuota",
    dek: "La categoría la define el tope de facturación, no el gusto. Pasarte no es un detalle de fin de año.",
    minutes: 6,
    sections: [
      {
        h: "La cuota es el piso, no el negocio",
        p: [
          "Cada categoría tiene un tope de ingresos brutos de los últimos doce meses y una cuota mensual. La cuota de servicios y la de bienes no siempre coinciden: a partir de cierta categoría, vender cosas y prestar servicios pagan distinto.",
          "La tabla que usa Caja Clara es la difundida para octubre 2026, vigente desde agosto. Tu cuota real puede ser menor si no pagás obra social o el aporte previsional, o mayor si tenés una deuda. La calculadora muestra la escala publicada, no tu cuenta corriente de ARCA.",
        ],
      },
      {
        h: "El tope se mira hacia atrás",
        p: [
          "No alcanza con que este mes hayas facturado poco. El encuadre mira doce meses. Un buen trimestre puede empujarte de categoría aunque ahora estés flojo. Si ya estás cerca del tope, el próximo trabajo grande conviene cotizarlo sabiendo que la cuota de arriba es otro número.",
          "Facturar por encima del tope de la categoría K deja el monotributo. Ahí el problema no es la cuota del mes: es el régimen. Por eso la calculadora marca la categoría que te corresponde con lo que llevás facturado, no la que te gustaría pagar.",
        ],
      },
      {
        h: "La tarifa por hora tiene que alcanzar la cuota",
        p: [
          "Si cobrás por hora, la cuota es un costo fijo. Repartila entre las horas que de verdad facturás, no entre las que estás despierto. Una categoría baja con una tarifa de relación de dependencia suele esconder que no estás cubriendo vacaciones, enfermedad ni los meses sin clientes.",
        ],
      },
    ],
  },
  {
    slug: "sueldo-o-factura",
    title: "Comparar un sueldo con facturar por tu cuenta",
    dek: "El bruto de la oferta y la factura del mes no están en la misma unidad. Hay que llevar los dos al neto.",
    minutes: 5,
    sections: [
      {
        h: "Llevá las dos ofertas a plata en el banco",
        p: [
          "Una oferta en relación de dependencia se mira en neto: bruto menos jubilación, PAMI y obra social, y menos Ganancias si tu recibo lo tiene. Caja Clara no calcula Ganancias. Si la oferta es alta, pedí el neto estimado antes de comparar.",
          "Facturar por tu cuenta se mira al revés. De lo que cobrás salen la cuota del monotributo, lo que no facturás (presupuestos, enfermedad, feriados) y los gastos que en un empleo paga la empresa: obra social, herramientas, un mes sin trabajo.",
        ],
      },
      {
        h: "Lo que el sueldo trae y la factura no",
        p: [
          "El empleo suma aguinaldo, vacaciones pagas, licencia por enfermedad y, si corresponde, indemnización. Una factura mensual igual al neto no empata eso. Para acercarte, el año del freelance tiene que rendir trece sueldos más las vacaciones, no doce.",
          "El empleador además pone contribuciones encima del bruto. Ese dinero no llega a tu cuenta ni en un caso ni en el otro, pero explica por qué una empresa puede ofrecer un bruto menor que tu factura y seguir siendo un costo alto para ella.",
        ],
      },
      {
        h: "Una cuenta, después el resto",
        p: [
          "Usá la calculadora de sueldo para el neto, la de monotributo para la cuota y la de tarifa para las horas facturables. Si los dos caminos dejan un número parecido, la decisión ya no es la cuenta: es el horario, el cliente único y si podés bancar un mes flojo.",
        ],
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
