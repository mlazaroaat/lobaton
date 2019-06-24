(function() {
   "use strict";

   // Establece d�nde colocar el bot�n.
   function buscarHueco() {
      return document.querySelector("a[onclick^=fSeleccionCentros]");
   }

   // Obtiene los cajetines en los que insertar los c�digos
   function buscarCajetines() {
      return document.querySelectorAll(".tdpeticioncodigo input[type='text']");
   }


   // Crea el importador de c�digos.
   function crearCargador() {
      const label = document.createElement("Label");
      label.textContent = "Importar c�digos";

      label.style.cursor = "pointer";
      label.style.color = "#fff";
      label.style.backgroundColor = "#007bff";
      label.style.borderColor = "#007bff";
      label.style.padding = ".375rem .75rem";
      label.style.fontWeight = "400";
      label.style.borderRadius = ".25rem";

      const input = document.createElement("input");
      label.appendChild(input);
      input.type = "file";
      input.setAttribute("accept", ".csv");
      input.style.display = "none";
      input.addEventListener("change", e => {
         const files = e.target.files;
         if(files.length === 0) return;

         const fileReader = new FileReader();
         fileReader.onloadend = function(e) {
            const codigos = parseCSV(this.result);
            if(confirm("Se insertar�n los c�digos BORRANDO todo los anteriores, aunque NO SE GUARDAR� el resultado, por lo que podr� revertir la importaci�n si sale de la p�gina sin GUARDAR los c�digos. Si desea fijar los c�digos de la importaci�n, REVISE LAS PETICIONES detenidamente antes y s�lo despues GUARDE los cambios. �Est� seguro de que quiere continuar?")) {
               insertarCodigos(codigos);
            }
         }
         fileReader.readAsText(files[0]);
      });

      return label;
   }


   // Procesa el CSV de entrada (obtiene los c�digos).
   function parseCSV(text) {
      text = text.split('\n');
      text.shift(); // La primera l�nea son los nombres de las columnas.
      // A las loclaidades hay que quitarle la L; y la C de los centros, permanece.
      return text.map(l => l.substring(0, 9));
   }


   // Inserta los c�digos en la p�gina.
   function insertarCodigos(codigos) {
      const inputs = buscarCajetines();

      if(codigos.length > inputs.length) {
         console.warn("Hay m�s c�digos que cajetines para a�adirlos");
      }

      for(let i=0; i<inputs.length; i++) {
         const input = inputs[i];
         input.value = codigos[i] || "";

         // Nombre del centro o localidad correspondientes.
         if(codigos[i]) deco(`c_vac${i+1}`, `d_vac${i+1}`, i+1);
         else document.getElementById(`d_vac${i+1}`).innerHTML = "";
      }
   }


   function crearExportador() {
      const a = document.createElement("a");
      a.download = "solicitudes.csv";

      a.style.display ="inline-block";
      a.style.color = "#fff";
      a.style.backgroundColor = "#007bff";
      a.style.borderColor = "#007bff";
      a.style.padding = ".375rem .75rem";
      a.style.fontWeight = "400";
      a.style.borderRadius = ".25rem";
      a.style.marginLeft = "20px";

      a.innerHTML = "Exportar c�digos";

      a.addEventListener("click", e=> {
         const file = new Blob([leerCodigos()], {type: "text/csv"});
         a.href = URL.createObjectURL(file);
      });

      return a;
   }


   function leerCodigos() {
      const lines = ["cod;peticion;tipo;name"];
      const inputs = buscarCajetines();

      function normalizeNombre(tipo, nombre) {
         if(tipo ==="L") nombre = nombre.substring(nombre.indexOf(":")+1);
         else {
            const p1 = nombre.lastIndexOf("(");
            if(p1 !== -1) nombre = nombre.substring(0, p1);
         }
         return nombre.trim();
      }


      for(let i=0; i<inputs.length; i++) {
         const input = inputs[i];
         let   codigo = input.value;

         if(!codigo) break;  // Se acabaron los c�digos
         
         let tipo = codigo.slice(-1) === "C"?"C":"L";

         if(tipo === "L") codigo += "L";

         let nombre = document.getElementById(`d_vac${i+1}`);
         nombre = normalizeNombre(tipo, nombre.firstElementChild.textContent);

         lines.push([codigo, i+1, tipo, nombre].join(";"));
      }

      return lines.join("\n");
   }

   const el = buscarHueco();
   if(!el) console.log("La p�gina no presenta hueco para insertar el bot�n");
   else  {
      el.parentNode.insertBefore(crearCargador(), el);
      el.parentNode.insertBefore(crearExportador(), el);
   }

})();
