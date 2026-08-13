import {
  readdir,
  readFile,
  writeFile,
  stat
} from "fs/promises";

import path from "path";


const ROOT="dist";

const PREFIX=
  "/unidaduniversal.github.io";


const TEXT_EXTENSIONS=new Set([
  ".html",
  ".htm",
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".xml",
  ".webmanifest",
  ".txt"
]);


const topEntries=
  new Set(
    await readdir(ROOT)
  );


const prefixBare=
  PREFIX.replace(
    /^\/+/,
    ""
  );


function canRewrite(raw){

  if(raw===""){
    return true;
  }


  const normalized=
    raw.replace(
      /^\/+/,
      ""
    );


  if(
    normalized===prefixBare
    ||
    normalized.startsWith(
      prefixBare+"/"
    )
  ){
    return false;
  }


  const clean=
    normalized.split(/[?#]/)[0];


  const first=
    clean.split("/")[0];


  return topEntries.has(first);
}


function rootUrl(raw){

  if(raw===""){
    return PREFIX+"/";
  }

  return (
    PREFIX
    +"/"
    +raw.replace(/^\/+/,"")
  );
}


function rewrite(text){

  /*
   * Quoted JS/HTML/JSON strings:
   *
   * "/IMG/x.webp"
   * '/SERVICIOS/x.html'
   * `/PARTIALS/x.html`
   */
  text=text.replace(
    /(["'`])\/(?!\/)([^"'`\s<>]*)/g,
    (all,quote,raw)=>{

      if(!canRewrite(raw)){
        return all;
      }


      return (
        quote
        +rootUrl(raw)
      );
    }
  );


  /*
   * CSS url(/IMG/foo.webp)
   */
  text=text.replace(
    /url\(\s*\/(?!\/)([^)\s'"]+)\s*\)/g,
    (all,raw)=>{

      if(!canRewrite(raw)){
        return all;
      }


      return (
        "url("
        +rootUrl(raw)
        +")"
      );
    }
  );


  /*
   * Sitemap-like:
   * <loc>/foo</loc>
   */
  text=text.replace(
    /(<loc>\s*)\/(?!\/)([^<]*)(<\/loc>)/gi,
    (all,start,raw,end)=>{

      if(!canRewrite(raw.trim())){
        return all;
      }


      return (
        start
        +rootUrl(raw.trim())
        +end
      );
    }
  );


  /*
   * srcset can contain multiple root-relative URLs.
   */
  text=text.replace(
    /srcset=(["'])(.*?)\1/gis,
    (all,quote,value)=>{

      const rewritten=
        value
        .split(",")
        .map(part=>{

          const trimmed=
            part.trim();


          const m=
            trimmed.match(
              /^\/(?!\/)(\S+)(.*)$/
            );


          if(!m){
            return trimmed;
          }


          if(!canRewrite(m[1])){
            return trimmed;
          }


          return (
            rootUrl(m[1])
            +m[2]
          );
        })
        .join(", ");


      return (
        "srcset="
        +quote
        +rewritten
        +quote
      );
    }
  );


  return text;
}


async function walk(dir){

  const entries=
    await readdir(
      dir,
      {
        withFileTypes:true
      }
    );


  for(const entry of entries){

    const full=
      path.join(
        dir,
        entry.name
      );


    if(entry.isDirectory()){

      await walk(full);
      continue;
    }


    const ext=
      path.extname(
        entry.name
      ).toLowerCase();


    if(!TEXT_EXTENSIONS.has(ext)){
      continue;
    }


    const before=
      await readFile(
        full,
        "utf8"
      );


    const after=
      rewrite(before);


    if(after!==before){

      await writeFile(
        full,
        after,
        "utf8"
      );
    }
  }
}


await walk(ROOT);


/*
 * HARD GATE:
 * detect any remaining quoted/url() local root paths
 * whose first segment actually exists in dist.
 */

const unresolved=[];


async function audit(dir){

  const entries=
    await readdir(
      dir,
      {
        withFileTypes:true
      }
    );


  for(const entry of entries){

    const full=
      path.join(
        dir,
        entry.name
      );


    if(entry.isDirectory()){

      await audit(full);
      continue;
    }


    const ext=
      path.extname(
        entry.name
      ).toLowerCase();


    if(!TEXT_EXTENSIONS.has(ext)){
      continue;
    }


    const text=
      await readFile(
        full,
        "utf8"
      );


    const quoted=
      /(["'`])\/(?!\/)([^"'`\s<>]*)/g;


    let match;


    while(
      (
        match=
          quoted.exec(text)
      )
    ){

      if(canRewrite(match[2])){

        unresolved.push(
          full
          +": "
          +match[0].slice(0,120)
        );


        if(unresolved.length>=30){
          break;
        }
      }
    }


    const css=
      /url\(\s*\/(?!\/)([^)\s'"]+)\s*\)/g;


    while(
      (
        match=
          css.exec(text)
      )
    ){

      if(canRewrite(match[1])){

        unresolved.push(
          full
          +": "
          +match[0].slice(0,120)
        );


        if(unresolved.length>=30){
          break;
        }
      }
    }


    if(unresolved.length>=30){
      break;
    }
  }
}


await audit(ROOT);


console.log(
  "PAGES_PREFIX="+PREFIX
);


console.log(
  "UNRESOLVED_LOCAL_ROOT_URLS="
  +unresolved.length
);


if(unresolved.length){

  unresolved.forEach(
    item=>
      console.error(
        "UNRESOLVED="+item
      )
  );


  process.exit(1);
}


console.log(
  "PAGES_PREFIX_REWRITE=PASS"
);
