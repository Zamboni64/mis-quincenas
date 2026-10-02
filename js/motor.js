/* Motor de cálculo: quincenas, plan de deudas, reparto de otros ingresos, pagos y exportación. Sin DOM. */
var Motor=(function(){
"use strict";
function pad(n){return (n<10?"0":"")+n}
function mk(y,m,d){var x=new Date(y,m-1,d);return x.getFullYear()+"-"+pad(x.getMonth()+1)+"-"+pad(x.getDate())}
function ym(s){return s.slice(0,7)}
function mround(x,m){return m>0?Math.round(x/m)*m:x}
function n(v){return typeof v==="number"&&isFinite(v)?v:0}
var FIRST="2026-09-25",FIN_Y=2028;
var MES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
function mesTxt(key){return MES[+key.slice(5,7)-1]+". "+key.slice(0,4)}
function quincenaDe(s){var y=+s.slice(0,4),m=+s.slice(5,7),k=+s.slice(8,10);
  if(k>=25)return mk(y,m,25);if(k>=10)return mk(y,m,10);return mk(y,m-1,25)}

/* Cuota de la tarjeta que se paga con la quincena del 25 del mes `key` (AAAA-MM). */
function cardCuota(P,key){
  if(key<="2026-11")return n(P.c_ago)+n(P.c_mp)+n(P.c_mahak)+n(P.c_apple_cap)+n(P.c_apple_int)+n(P.c_manejo);
  if(key<="2027-07")return n(P.c_ago)+n(P.c_manejo);
  return n(P.c_manejo)}
function cardCapital(P,key){
  if(key<="2026-11")return n(P.c_ago)+n(P.c_mp)+n(P.c_mahak)+n(P.c_apple_cap);
  if(key==="2026-12")return n(P.c_ago)+n(P.apple_saldo)-2*n(P.c_apple_cap);
  if(key<="2027-07")return n(P.c_ago);
  return 0}

/* Reparto de la plata que entra para "colchón y deudas": colchón -> primo -> Apple -> abono a capital. */
function reparto(P,ingresos){
  var meta=n(P.meta),primo=n(P.primo),apple=n(P.apple_saldo),cut=P.cutoff||"2026-12-10";
  var lst=ingresos.filter(function(x){return x.destino==="deudas"}).slice()
    .sort(function(a,b){return (a.fecha+(a.creado||"")).localeCompare(b.fecha+(b.creado||""))});
  var acc=0,out={},T={colchon:0,primo:0,apple:0,abono:0,total:0};
  lst.forEach(function(x){var v=n(x.valor),a={colchon:0,primo:0,apple:0,abono:0};
    if(x.fecha<cut){var b=acc,f=acc+v;
      a.colchon=Math.max(0,Math.min(f,meta)-Math.min(b,meta));
      a.primo=Math.max(0,Math.min(f,meta+primo)-Math.max(b,meta));
      a.apple=Math.max(0,Math.min(f,meta+primo+apple)-Math.max(b,meta+primo));
      acc=f}
    a.abono=v-a.colchon-a.primo-a.apple;out[x.id]=a;
    T.colchon+=a.colchon;T.primo+=a.primo;T.apple+=a.apple;T.abono+=a.abono;T.total+=v});
  var prima=n(P.prima),primoF=primo-T.primo,appleF=apple-T.apple;
  var colDic=Math.min(prima-primoF-appleF,Math.max(0,meta-T.colchon));
  return {porId:out,tot:T,lista:lst,primoFalta:primoF,appleFalta:appleF,colchonDic:colDic,abonoDic:prima-primoF-appleF-colDic}}

/* Plan de deudas mes a mes desde octubre de 2026. */
function plan(P,R){
  var r=n(P.dav_tasa),nn=n(P.dav_plazo)||12,davMes=n(P.dav10)+n(P.dav25),pct=(P.pct==null?1:n(P.pct));
  var pmt=r>0?n(P.dav_saldo)*r/(1-Math.pow(1+r,-nn)):n(P.dav_saldo)/nn;
  var davPI=Math.min(pmt,davMes),occR=Math.pow(1+n(P.occ_ea),1/12)-1;
  var rows=[],B=n(P.dav_saldo),G=n(P.occ_saldo),M=n(P.card_saldo),y=2026,m=10;
  while(y<2030){var key=y+"-"+pad(m);
    var C=Math.round(B*r),D=Math.min(davPI,B+C);
    var O=pct*((B>0?davPI-D:davMes)+(key>="2027-08"?n(P.c_ago):0));
    if(y>=2027&&(m===6||m===12))O+=n(P.prima);
    R.lista.forEach(function(x){if(ym(x.fecha)===key)O+=R.porId[x.id].abono});
    if(key==="2026-12")O+=R.abonoDic;
    var E=Math.min(O,B+C-D),F=Math.round(B+C-D-E);
    var H=Math.round(G*occR),I=Math.min(2*n(P.occ)-n(P.occ_seg),G+H),J=Math.min(O-E,G+H-I),K=Math.round(G+H-I-J);
    var L=Math.min(cardCapital(P,key),M);M=M-L;
    var N=0;if(key<="2026-11"){var rp=0;R.lista.forEach(function(x){if(ym(x.fecha)<=key)rp+=R.porId[x.id].primo});N=Math.max(0,n(P.primo)-rp)}
    rows.push({mes:key,davIni:B,davInt:C,davCuota:D,davAbono:E,dav:F,occIni:G,occInt:H,occCuota:I,occAbono:J,occ:K,cardPago:L,card:M,primo:N,disponible:O,total:F+K+M+N});
    B=F;G=K;m++;if(m>12){m=1;y++}}
  function cero(k){for(var i=0;i<rows.length;i++)if(rows[i][k]===0)return rows[i].mes;return null}
  var fd=cero("dav"),fo=cero("occ");
  return {filas:rows,finDav:fd,finOcc:fo,finCard:cero("card"),finTodo:cero("total"),
    davLast:fd?fd+"-25":"2029-12-25",occLast:fo?fo+"-25":"2029-12-25",
    totalHoy:n(P.occ_saldo)+n(P.dav_saldo)+n(P.card_saldo)+n(P.primo)}}

/* Gastos fijos que el usuario agrega (P.fijosExtra). Cada uno tiene día del mes, valor y mes desde el que empieza.
   Del 10 al 24 sale de la quincena del 10; del 25 al 9 sale de la quincena del 25. */
function activo(x,mesPago){return (!x.desde||mesPago>=x.desde)&&(!x.hasta||mesPago<=x.hasta)}
function extrasDe(P,dt,is10,first){
  var y=+dt.slice(0,4),m=+dt.slice(5,7),este=ym(dt),sig=ym(mk(y,m+1,1)),out=[];
  (P.fijosExtra||[]).forEach(function(x){var d=n(x.dia)||1,v=n(x.valor);if(!v)return;
    if(is10){if(d>=10&&d<=24&&activo(x,este))out.push({nombre:x.nombre,valor:v})}
    else{if(d>=25&&!first&&activo(x,este))out.push({nombre:x.nombre,valor:v});
      if(d<=9&&activo(x,sig))out.push({nombre:x.nombre,valor:v})}});
  return out}

/* Quincenas: qué entra, qué sale, cuánto se guarda para la otra quincena y cuánto queda libre. */
function quincenas(P,ingresos,R,PL){
  var pct=(P.pct==null?1:n(P.pct)),fechas=[FIRST],y,m;
  for(y=2026,m=10;y<=FIN_Y;){fechas.push(mk(y,m,10),mk(y,m,25));m++;if(m>12){m=1;y++}}
  var extraQ={};ingresos.forEach(function(x){if(x.destino!=="deudas"){var q=quincenaDe(x.fecha);extraQ[q]=(extraQ[q]||0)+n(x.valor)}});
  var SAL=["arriendo","internet","datos","icloud","youtube","tarjeta","segsalud","seghogar","cadena","otros","primo","apple","abono","colchon"];
  var filas=fechas.map(function(dt){
    var is10=dt.slice(8)==="10",key=ym(dt),first=dt===FIRST,yr=+dt.slice(0,4),mth=+dt.slice(5,7);
    var o={fecha:dt,sueldo:0,salud:0,pension:0,casino:0,aporte:0,occ:0,dav:0,prima:0,extra:extraQ[dt]||0,reserva:0,
      arriendo:0,internet:0,datos:0,icloud:0,youtube:0,tarjeta:0,segsalud:0,seghogar:0,cadena:0,otros:0,otrosDetalle:[],primo:0,apple:0,abono:0,colchon:0,aparta:0};
    if(!first){o.sueldo=n(P.sueldo);o.salud=n(P.salud);o.pension=n(P.pension);o.casino=n(P.casino);o.aporte=n(P.aporte);
      o.occ=dt<=PL.occLast?n(P.occ):0;o.dav=dt<=PL.davLast?n(is10?P.dav10:P.dav25):0}
    o.neto=o.sueldo-o.salud-o.pension-o.casino-o.aporte-o.occ-o.dav;
    var primaCol=dt==="2026-12-10",primaAb=yr>=2027&&((mth===6&&!is10)||(mth===12&&is10));
    if(primaCol||primaAb)o.prima=n(P.prima);
    if(is10){o.arriendo=n(P.arriendo);o.internet=n(P.internet);o.datos=n(P.datos);o.icloud=n(P.icloud)}
    else{o.youtube=n(P.youtube);if(!first){o.tarjeta=cardCuota(P,key);o.segsalud=n(P.segsalud);o.seghogar=n(P.seghogar);o.cadena=n(P.cadena)}}
    o.otrosDetalle=extrasDe(P,dt,is10,first);o.otrosDetalle.forEach(function(x){o.otros+=x.valor});
    if(primaCol){o.primo=R.primoFalta;o.apple=R.appleFalta;o.colchon=R.colchonDic}
    if(!first&&dt<=PL.occLast){var ab=dt>PL.davLast?n(is10?P.dav10:P.dav25)*pct:0;
      if(!is10&&dt>="2027-08-25")ab+=n(P.c_ago)*pct;if(primaAb)ab+=o.prima;if(primaCol)ab+=R.abonoDic;o.abono=ab}
    o.salidas=0;SAL.forEach(function(k){o.salidas+=o[k]});
    return o});
  filas.forEach(function(o,i){
    o.reserva=i===0?n(P.saldo_hoy):filas[i-1].aparta;
    if(i<filas.length-1){var s=filas[i+1];
      o.aparta=mround(Math.max(0,((o.neto+o.prima+o.reserva-o.salidas)-(s.neto+s.prima-s.salidas))/2),n(P.redondeo)||5000)}
    o.totalSale=o.salidas+o.aparta;
    o.libre=o.neto+o.prima+o.extra+o.reserva-o.totalSale});
  var porFecha={};filas.forEach(function(o){porFecha[o.fecha]=o});
  return {filas:filas,porFecha:porFecha}}

/* Pagos que se hacen a mano cada mes. */
function slug(s){return s.normalize("NFKD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function pagos(P){
  var out=[],y=2026,m=10;
  while(y<=FIN_Y){var key=y+"-"+pad(m),prev=m>1?y+"-"+pad(m-1):(y-1)+"-12";
    [["Tarjeta Davibank",n(P.dia_tarjeta)||7,(key==="2026-10"&&n(P.tarjeta_primera))?n(P.tarjeta_primera):cardCuota(P,prev),13],
     ["Arriendo",n(P.dia_arriendo)||10,n(P.arriendo),3],["Internet",n(P.dia_internet)||10,n(P.internet),3],
     ["Datos del celular",n(P.dia_datos)||10,n(P.datos),3],["Cadena",n(P.dia_cadena)||25,n(P.cadena),3]]
      .forEach(function(a){out.push({id:key+"-"+slug(a[0]),nombre:a[0],fecha:mk(y,m,a[1]),valor:a[2],aviso:a[3]})});
    (P.fijosExtra||[]).forEach(function(x){if(x.automatico||!n(x.valor)||!activo(x,key))return;
      var dia=Math.min(n(x.dia)||1,new Date(y,m,0).getDate());
      out.push({id:key+"-extra-"+x.id,nombre:x.nombre||"Gasto fijo",fecha:mk(y,m,dia),valor:n(x.valor),aviso:3})});
    m++;if(m>12){m=1;y++}}
  return out.sort(function(a,b){return a.fecha.localeCompare(b.fecha)})}

function calcular(P,ingresos){
  ingresos=ingresos||[];var R=reparto(P,ingresos),PL=plan(P,R),Q=quincenas(P,ingresos,R,PL);
  return {reparto:R,plan:PL,quincenas:Q.filas,porFecha:Q.porFecha,pagos:pagos(P)}}

/* Libro de Excel con toda la información (valores, sin fórmulas). Devuelve los bytes del .xlsx. */
function construirLibro(d){
  function x(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]}).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,"")}
  function letra(i){var s="";i++;while(i>0){var r=(i-1)%26;s=String.fromCharCode(65+r)+s;i=Math.floor((i-1)/26)}return s}
  function serial(f){return (Date.UTC(+f.slice(0,4),+f.slice(5,7)-1,+f.slice(8,10))-Date.UTC(1899,11,30))/86400000}
  var EST={"$":2,"f":3,"%":4,"$b":5};
  function celda(ref,v,t){
    if(v===null||v===undefined||v==="")return "";
    if(t==="f")return '<c r="'+ref+'" s="3"><v>'+serial(v)+'</v></c>';
    if(typeof v==="number")return '<c r="'+ref+'" s="'+(EST[t]||0)+'"><v>'+v+'</v></c>';
    return '<c r="'+ref+'" s="0" t="inlineStr"><is><t xml:space="preserve">'+x(v)+'</t></is></c>'}
  function hojaXml(h){
    var o='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
      '<sheetViews><sheetView workbookViewId="0"><pane xSplit="1" ySplit="1" topLeftCell="B2" activePane="bottomRight" state="frozen"/></sheetView></sheetViews><cols>';
    h.cols.forEach(function(c,i){o+='<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+(c[3]||14)+'" customWidth="1"/>'});
    o+='</cols><sheetData><row r="1" ht="32" customHeight="1">';
    h.cols.forEach(function(c,i){o+='<c r="'+letra(i)+'1" s="1" t="inlineStr"><is><t>'+x(c[0])+'</t></is></c>'});
    o+='</row>';
    h.filas.forEach(function(f,ri){o+='<row r="'+(ri+2)+'">';
      h.cols.forEach(function(c,i){o+=celda(letra(i)+(ri+2),f[c[1]],c[2]==="v"?f._t:c[2])});o+='</row>'});
    return o+'</sheetData></worksheet>'}
  var gastoQ={};d.gastos.forEach(function(g){var q=g.quincena||quincenaDe(g.fecha);gastoQ[q]=(gastoQ[q]||0)+n(g.valor)});
  var hojas=[
   {nombre:"Quincenas",cols:[["Fecha de pago","fecha","f",13],["Sueldo","sueldo","$"],["Salud","salud","$"],["Pensión","pension","$"],["Casino","casino","$"],["Aporte","aporte","$"],
    ["Libranza Occidente","occ","$"],["Libranza Davivienda","dav","$"],["Neto que recibe","neto","$b"],["Prima","prima","$"],["Ingresos extra para gastar","extra","$"],
    ["Reserva que trae de la quincena anterior","reserva","$"],["Arriendo","arriendo","$"],["Internet","internet","$"],["Datos celular","datos","$"],["iCloud+","icloud","$"],
    ["YouTube Premium","youtube","$"],["Tarjeta Davibank","tarjeta","$"],["Seguro de salud","segsalud","$"],["Seguro de hogar","seghogar","$"],["Cadena","cadena","$"],["Otros gastos fijos","otros","$"],
    ["Pago al primo","primo","$"],["Apple a 1 cuota","apple","$"],["Abono extra a deudas","abono","$"],["Aparta para colchón","colchon","$"],
    ["Aparta para la quincena siguiente","aparta","$"],["Total que sale","totalSale","$"],["Libre para comida, transporte y demás","libre","$b",16],
    ["Gastado según su registro","gastado","$"],["Saldo que le queda","saldo","$b"]],
    filas:d.calc.quincenas.map(function(q){var o=Object.assign({},q);
      if(d.ajustes&&d.ajustes[q.fecha]!=null)o.libre=d.ajustes[q.fecha]+q.extra;
      o.gastado=gastoQ[q.fecha]||0;o.saldo=o.libre-o.gastado;return o})},
   {nombre:"Gastos",cols:[["Fecha","fecha","f",13],["Categoría","categoria","",26],["Descripción","descripcion","",44],["Valor","valor","$"],["Cómo pagó","medio","",18],["Quincena","quincena","f",13]],
    filas:d.gastos.slice().sort(function(a,b){return (a.fecha+(a.creado||"")).localeCompare(b.fecha+(b.creado||""))})
      .map(function(g){return {fecha:g.fecha,categoria:g.categoria,descripcion:g.descripcion||"",valor:n(g.valor),medio:g.medio||"",quincena:g.quincena||quincenaDe(g.fecha)}})},
   {nombre:"Otros ingresos",cols:[["Fecha","fecha","f",13],["De dónde viene","origen","",26],["Valor recibido","valor","$"],["¿Para qué?","destino","",18],
    ["Al colchón","colchon","$"],["Al primo","primo","$"],["A Apple","apple","$"],["Abono a capital","abono","$"],["Para gastar","gastar","$"]],
    filas:d.ingresos.slice().sort(function(a,b){return a.fecha.localeCompare(b.fecha)}).map(function(i){var a=d.calc.reparto.porId[i.id]||{colchon:0,primo:0,apple:0,abono:0},dd=i.destino==="deudas";
      return {fecha:i.fecha,origen:i.origen||i.concepto||"",valor:n(i.valor),destino:dd?"Colchón y deudas":"Para gastar",colchon:a.colchon,primo:a.primo,apple:a.apple,abono:a.abono,gastar:dd?0:n(i.valor)}})},
   {nombre:"Pagos",cols:[["Mes","mes","",12],["Pago","nombre","",22],["Fecha límite","fecha","f",13],["Valor","valor","$"],["¿Pagado?","pagado","",11]],
    filas:d.calc.pagos.map(function(p){return {mes:mesTxt(ym(p.fecha)),nombre:p.nombre,fecha:p.fecha,valor:p.valor,pagado:d.hechos[p.id]?"Sí":""}})},
   {nombre:"Plan de deudas",cols:[["Mes","mes","",12],["Davivienda: saldo inicial","davIni","$"],["Davivienda: interés","davInt","$"],["Davivienda: cuota sin seguro","davCuota","$"],
    ["Davivienda: abono extra","davAbono","$"],["Davivienda: saldo final","dav","$b"],["Occidente: saldo inicial","occIni","$"],["Occidente: interés","occInt","$"],
    ["Occidente: cuota sin seguro","occCuota","$"],["Occidente: abono extra","occAbono","$"],["Occidente: saldo final","occ","$b"],["Tarjeta: pago a capital","cardPago","$"],
    ["Tarjeta: saldo final","card","$b"],["Primo: saldo final","primo","$b"],["Disponible para abonos extra","disponible","$",16],["Deuda total al final del mes","total","$b",16]],
    filas:d.calc.plan.filas.map(function(f){var o=Object.assign({},f);o.mes=mesTxt(f.mes);return o})},
   {nombre:"Datos",cols:[["Dato","k","",46],["Valor","v","v",18]],filas:d.datos.map(function(a){return {k:a[0],v:a[1],_t:a[2]}})}];
  var NS='xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"',H='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  var archivos=[["[Content_Types].xml",H+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'+
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+
      hojas.map(function(h,i){return '<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'}).join("")+'</Types>'],
    ["_rels/.rels",H+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ["xl/workbook.xml",H+'<workbook '+NS+' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+
      hojas.map(function(h,i){return '<sheet name="'+x(h.nombre)+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>'}).join("")+'</sheets></workbook>'],
    ["xl/_rels/workbook.xml.rels",H+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
      hojas.map(function(h,i){return '<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>'}).join("")+
      '<Relationship Id="rId'+(hojas.length+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
    ["xl/styles.xml",H+'<styleSheet '+NS+'><numFmts count="3"><numFmt numFmtId="164" formatCode="&quot;$&quot;#,##0;(&quot;$&quot;#,##0);-"/><numFmt numFmtId="165" formatCode="dd/mm/yyyy"/><numFmt numFmtId="166" formatCode="0.000%"/></numFmts>'+
      '<fonts count="3"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font><font><b/><sz val="10"/><name val="Arial"/></font></fonts>'+
      '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F3864"/><bgColor indexed="64"/></patternFill></fill></fills>'+
      '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'+
      '<cellXfs count="6"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyFont="1"/>'+
      '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>'+
      '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/>'+
      '<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1" applyAlignment="1"><alignment horizontal="center"/></xf>'+
      '<xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/>'+
      '<xf numFmtId="164" fontId="2" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/></cellXfs></styleSheet>']];
  hojas.forEach(function(h,i){archivos.push(["xl/worksheets/sheet"+(i+1)+".xml",hojaXml(h)])});
  return zip(archivos)}

/* ZIP sin compresión (método "stored"), suficiente para un .xlsx. */
var CRC=(function(){var t=[],c,k,i;for(i=0;i<256;i++){c=i;for(k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[i]=c>>>0}return t})();
function crc32(b){var c=0xFFFFFFFF;for(var i=0;i<b.length;i++)c=CRC[(c^b[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function zip(archivos){
  var enc=new TextEncoder(),partes=[],central=[],off=0;
  function u16(v){return [v&255,(v>>>8)&255]}function u32(v){return [v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255]}
  archivos.forEach(function(a){var nombre=enc.encode(a[0]),datos=enc.encode(a[1]),crc=crc32(datos);
    var cab=[].concat(u32(0x04034b50),u16(20),u16(0x0800),u16(0),u16(0),u16(0x21),u32(crc),u32(datos.length),u32(datos.length),u16(nombre.length),u16(0));
    partes.push(new Uint8Array(cab),nombre,datos);
    central.push({cab:[].concat(u32(0x02014b50),u16(20),u16(20),u16(0x0800),u16(0),u16(0),u16(0x21),u32(crc),u32(datos.length),u32(datos.length),u16(nombre.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(off)),nombre:nombre});
    off+=cab.length+nombre.length+datos.length});
  var tam=0;central.forEach(function(c){partes.push(new Uint8Array(c.cab),c.nombre);tam+=c.cab.length+c.nombre.length});
  partes.push(new Uint8Array([].concat(u32(0x06054b50),u16(0),u16(0),u16(archivos.length),u16(archivos.length),u32(tam),u32(off),u16(0))));
  var total=0;partes.forEach(function(p){total+=p.length});var out=new Uint8Array(total),pos=0;
  partes.forEach(function(p){out.set(p,pos);pos+=p.length});return out}

return {calcular:calcular,quincenaDe:quincenaDe,mk:mk,mesTxt:mesTxt,MES:MES,FIRST:FIRST,construirLibro:construirLibro};
})();
if(typeof module!=="undefined")module.exports=Motor;
