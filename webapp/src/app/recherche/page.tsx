"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { CircularProgress } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { ChunkSearchResults, DocumentSearchResults, MediaType } from "@/types/vectordb";
import { signal } from "@preact/signals-react";
import { getSearchWords } from "./text-highlighter";
import DocumentCardWithChunks from "./DocumentCardWithChunks";
import ChunkRenderer from "./DocumentChunkFull";
import Masonry from '@mui/lab/Masonry';
import { styled } from '@mui/material/styles';
import { DEFAULT_PAGE_NUMBER } from "@/config";
import SIPagination, { pageNumber } from "./SIPagination";
import { fetchSIContent } from "./fetchSIContent";
import Tabs, { ColumnsMediaTypeMap, selectedTabType, TabMediaTypeMap } from "./Tabs";

const Item = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(0.5),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const groupByDocument = signal<boolean>(false);

const Search: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || "";
  const searchWords = getSearchWords(query);
  // const queryClient = useQueryClient();

  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['search', query, groupByDocument.value, null, pageNumber.value, DEFAULT_PAGE_NUMBER] as const,
    queryFn: fetchSIContent,
    enabled: !!query,
  });

  const renderSearchResults = () => {
    if (isLoading) return <LoadingIndicator />;
    if (isError) return <ErrorMessage />;
    if (!results) return <NoResultsMessage />;
    const xx = {page_count: 1,"chunks":[{"documentId":"69aeddd4-be4b-4422-8203-d47faa51625a","text":"Ceci est une image d'une scène de dinosaure. Il y a trois dinosaures dans l'image. Un des dinosaures est un brontosaure. Les deux autres dinosaures sont un t rex. Il y a un crocodile dans l'eau. L'eau est bleue. Le crocodile est dans le sable. Le sable est brun clair. L'herbe est courte et verte. Les arbres en arrière-plan sont grands et fins. Le ciel est bleu avec des nuages blancs.","title":"","mediaType":"pdf_image","docId":"72131e2f-c714-40d7-a39b-4a6a14463295","metadata":{"id":"01590827-528c-4214-a60e-c0b5e0162ce7","s3ObjectName":"pdf/7b91237e-6db7-420e-bfa9-b9af4aecccca.pdf/images/c7834b05-11cf-401c-be34-dbd62e93bf73.png","pageNumber":1,"bbox":{"x1":388.739990234375,"x2":388.739990234375,"y1":388.739990234375,"y2":388.739990234375},"type":null,"start":null,"end":null,"question":null,"answer":null,"url":null,"documentChunkId":"72131e2f-c714-40d7-a39b-4a6a14463295"},"document":{"id":"69aeddd4-be4b-4422-8203-d47faa51625a","s3ObjectName":"pdf/7b91237e-6db7-420e-bfa9-b9af4aecccca.pdf","originalPath":"/server/ftp-data/DMSE/Cahiers finis CDE/Cahiers finis DSIT (209)/Sur la piste des dinosaures/sur la piste des dinosaures.pdf","publicPath":"","mediaName":"sur la piste des dinosaures"},"score":0.399641752187875},{"documentId":"14bf751b-1458-4a3e-b17f-98d476c14a8a","text":"Une illustration de dinosaures est montrée. Il y a une silhouette d'un homme sur le côté gauche de l'image. Il porte un chapeau haut et tient un long bâton. Il y a quatre dinosaures dans l'image qui sont montrés.","title":"","mediaType":"pdf_image","docId":"2257ab57-6d81-462c-be26-e2c2adeadb2f","metadata":{"id":"02037934-1687-4265-a63b-28071a8382db","s3ObjectName":"pdf/2dce13b8-8bc6-4947-87c7-bdede8026797.pdf/images/8cef9195-c670-478a-acac-c410b868359e.png","pageNumber":26,"bbox":{"x1":523.8999633789062,"x2":523.8999633789062,"y1":523.8999633789062,"y2":523.8999633789062},"type":null,"start":null,"end":null,"question":null,"answer":null,"url":null,"documentChunkId":"2257ab57-6d81-462c-be26-e2c2adeadb2f"},"document":{"id":"14bf751b-1458-4a3e-b17f-98d476c14a8a","s3ObjectName":"pdf/2dce13b8-8bc6-4947-87c7-bdede8026797.pdf","originalPath":"/server/ftp-data/dossiers-pédagogiques/astro/2015/2015 - Dinosaures.pdf","publicPath":"","mediaName":"2015 - Dinosaures"},"score":0.3943544584020451},{"documentId":"14bf751b-1458-4a3e-b17f-98d476c14a8a","text":"L'image est une image en noir et blanc d'un squelette d'un animal. Le squelette de l' animal semble provenir d'un dinosaure. Il a un long col et une longue queue. Il y a deux petits pieds en bas du squelette. Il y a un long point à l'extrémité du col du corps. La tête du dinosaure est en haut de l'image.","title":"","mediaType":"pdf_image","docId":"2eba87ce-80b3-420a-9fef-9b6b998a3395","metadata":{"id":"3537baa8-4807-4c03-8444-b8690b361ade","s3ObjectName":"pdf/2dce13b8-8bc6-4947-87c7-bdede8026797.pdf/images/3399e813-908d-446a-8866-006e8cc3684e.png","pageNumber":18,"bbox":{"x1":524.2999877929688,"x2":524.2999877929688,"y1":524.2999877929688,"y2":524.2999877929688},"type":null,"start":null,"end":null,"question":null,"answer":null,"url":null,"documentChunkId":"2eba87ce-80b3-420a-9fef-9b6b998a3395"},"document":{"id":"14bf751b-1458-4a3e-b17f-98d476c14a8a","s3ObjectName":"pdf/2dce13b8-8bc6-4947-87c7-bdede8026797.pdf","originalPath":"/server/ftp-data/dossiers-pédagogiques/astro/2015/2015 - Dinosaures.pdf","publicPath":"","mediaName":"2015 - Dinosaures"},"score":0.3931362867646051},{"documentId":"7675c73f-c864-40e8-ba41-80132a1ceec0","text":"Une image d'un dinosaure. Le dinosaure a des dentures pointues. Les dentures sont blanches. La bouche du dinosaure est ouverte. Il y a une langue rouge brillante qui sort de la bouche. Il y a des yeux jaunes dans l'image. Le fond de l'image est noir. L'image est ronde. La tête du dinosaure est marron. Les yeux sont jaunes.","title":"","mediaType":"pdf_image","docId":"07c71cff-5a58-4f11-a594-9a5292586382","metadata":{"id":"ebd925de-2e07-40e6-b04d-65e0612b7bf1","s3ObjectName":"pdf/b6419b56-8b86-4bfa-8e3c-7af305795278.pdf/images/972e71e7-977d-4159-8d21-9c0df43ef69f.png","pageNumber":7,"bbox":{"x1":491.4499816894531,"x2":491.4499816894531,"y1":491.4499816894531,"y2":491.4499816894531},"type":null,"start":null,"end":null,"question":null,"answer":null,"url":null,"documentChunkId":"07c71cff-5a58-4f11-a594-9a5292586382"},"document":{"id":"7675c73f-c864-40e8-ba41-80132a1ceec0","s3ObjectName":"pdf/b6419b56-8b86-4bfa-8e3c-7af305795278.pdf","originalPath":"/server/ftp-data/dossiers-pédagogiques/astro/2015/2015 - Dinosaures - parcours élèves.pdf","publicPath":"","mediaName":"2015 - Dinosaures - parcours élèves"},"score":0.3803868306620999},{"documentId":"14bf751b-1458-4a3e-b17f-98d476c14a8a","text":"Deux images des os d'un dinosaure sont affichées. L'image sur la gauche est étiquetée avec le mot «  ilium  » en haut. Sur la droite est étiquetée «  ischium  » qui est le nom du dinosaure. Les deux images sont de couleur brun clair et sont dessinées dans un style caricaturiste.","title":"","mediaType":"pdf_image","docId":"c938a833-f0fe-48e1-9155-7d5edeb0cd5f","metadata":{"id":"748a358f-a49b-4879-9193-365edff5a02c","s3ObjectName":"pdf/2dce13b8-8bc6-4947-87c7-bdede8026797.pdf/images/6cab88cc-928b-459f-9ae5-88ec853e4c88.png","pageNumber":11,"bbox":{"x1":523.8999633789062,"x2":523.8999633789062,"y1":523.8999633789062,"y2":523.8999633789062},"type":null,"start":null,"end":null,"question":null,"answer":null,"url":null,"documentChunkId":"c938a833-f0fe-48e1-9155-7d5edeb0cd5f"},"document":{"id":"14bf751b-1458-4a3e-b17f-98d476c14a8a","s3ObjectName":"pdf/2dce13b8-8bc6-4947-87c7-bdede8026797.pdf","originalPath":"/server/ftp-data/dossiers-pédagogiques/astro/2015/2015 - Dinosaures.pdf","publicPath":"","mediaName":"2015 - Dinosaures"},"score":0.37826419113897536},{"documentId":"14bf751b-1458-4a3e-b17f-98d476c14a8a","text":"Une image d'un squelette de dinosaure sur une roc. Le squelette de dinosaure est brun et a de longues pattes et un long col. Il y a un long museau sur la tête du dinosaure.","title":"","mediaType":"pdf_image","docId":"8db961d2-66b6-4ff3-a860-01a1a0f74305","metadata":{"id":"8ed80f65-a794-4673-bd68-fd7b94776809","s3ObjectName":"pdf/2dce13b8-8bc6-4947-87c7-bdede8026797.pdf/images/466d0b69-6159-4416-a670-d952c6bdfed1.png","pageNumber":19,"bbox":{"x1":524.5499877929688,"x2":524.5499877929688,"y1":524.5499877929688,"y2":524.5499877929688},"type":null,"start":null,"end":null,"question":null,"answer":null,"url":null,"documentChunkId":"8db961d2-66b6-4ff3-a860-01a1a0f74305"},"document":{"id":"14bf751b-1458-4a3e-b17f-98d476c14a8a","s3ObjectName":"pdf/2dce13b8-8bc6-4947-87c7-bdede8026797.pdf","originalPath":"/server/ftp-data/dossiers-pédagogiques/astro/2015/2015 - Dinosaures.pdf","publicPath":"","mediaName":"2015 - Dinosaures"},"score":0.37115935218614027},{"documentId":"69aeddd4-be4b-4422-8203-d47faa51625a","text":"Ceci est une illustration de dinosaures. Les dinosaures sont dans un environnement désertique. Il y a des arbres en arrière-plan. Le ciel est bleu avec des nuages blancs. Il y a un étang d'eau devant les dinosaures.","title":"","mediaType":"pdf_image","docId":"960ab021-7db6-4390-9c76-dbb682c4a049","metadata":{"id":"4c6429f1-d8e4-4711-988d-a1c6630889be","s3ObjectName":"pdf/7b91237e-6db7-420e-bfa9-b9af4aecccca.pdf/images/9c3eb963-c0ed-4888-9626-412531ba9848.png","pageNumber":29,"bbox":{"x1":531.3599853515625,"x2":531.3599853515625,"y1":531.3599853515625,"y2":531.3599853515625},"type":null,"start":null,"end":null,"question":null,"answer":null,"url":null,"documentChunkId":"960ab021-7db6-4390-9c76-dbb682c4a049"},"document":{"id":"69aeddd4-be4b-4422-8203-d47faa51625a","s3ObjectName":"pdf/7b91237e-6db7-420e-bfa9-b9af4aecccca.pdf","originalPath":"/server/ftp-data/DMSE/Cahiers finis CDE/Cahiers finis DSIT (209)/Sur la piste des dinosaures/sur la piste des dinosaures.pdf","publicPath":"","mediaName":"sur la piste des dinosaures"},"score":0.3628780399032623},{"documentId":"7675c73f-c864-40e8-ba41-80132a1ceec0","text":"Dessin d'un dinosaure. Le dinosaure est brun. Il y a beaucoup de trous sur la tête du dinosaure. Il y a une longue queue sur le dinosaure.","title":"","mediaType":"pdf_image","docId":"d0470660-4a9f-4381-92fe-f02e2c78b133","metadata":{"id":"c65a85b5-e620-41ad-a9aa-da487818a308","s3ObjectName":"pdf/b6419b56-8b86-4bfa-8e3c-7af305795278.pdf/images/48cca1bc-61b1-4c8e-a191-502ba9b6a9fe.png","pageNumber":6,"bbox":{"x1":507,"x2":507,"y1":507,"y2":507},"type":null,"start":null,"end":null,"question":null,"answer":null,"url":null,"documentChunkId":"d0470660-4a9f-4381-92fe-f02e2c78b133"},"document":{"id":"7675c73f-c864-40e8-ba41-80132a1ceec0","s3ObjectName":"pdf/b6419b56-8b86-4bfa-8e3c-7af305795278.pdf","originalPath":"/server/ftp-data/dossiers-pédagogiques/astro/2015/2015 - Dinosaures - parcours élèves.pdf","publicPath":"","mediaName":"2015 - Dinosaures - parcours élèves"},"score":0.3580763237952369},{"documentId":"14bf751b-1458-4a3e-b17f-98d476c14a8a","text":"Dessin d'un dinosaure. Le dinosaure est brun. Il y a beaucoup de trous sur la tête du dinosaure. Il y a une longue queue sur le dinosaure.","title":"","mediaType":"pdf_image","docId":"d2129927-0e80-41be-bae2-70376cf724c7","metadata":{"id":"b580f832-12d0-4786-80ea-a691643a624f","s3ObjectName":"pdf/2dce13b8-8bc6-4947-87c7-bdede8026797.pdf/images/5eaa660b-bf16-4f90-81b7-486d5fcd99bb.png","pageNumber":23,"bbox":{"x1":499.1999816894531,"x2":499.1999816894531,"y1":499.1999816894531,"y2":499.1999816894531},"type":null,"start":null,"end":null,"question":null,"answer":null,"url":null,"documentChunkId":"d2129927-0e80-41be-bae2-70376cf724c7"},"document":{"id":"14bf751b-1458-4a3e-b17f-98d476c14a8a","s3ObjectName":"pdf/2dce13b8-8bc6-4947-87c7-bdede8026797.pdf","originalPath":"/server/ftp-data/dossiers-pédagogiques/astro/2015/2015 - Dinosaures.pdf","publicPath":"","mediaName":"2015 - Dinosaures"},"score":0.3580763237952369},{"documentId":"14bf751b-1458-4a3e-b17f-98d476c14a8a","text":"L'image est d'un squelette de dinosaure. Le fond est complètement noir. En bas de l'image se trouve une pierre grise. Le squelette du dinosaure est orange brunâtre.","title":"","mediaType":"pdf_image","docId":"dc164b91-a351-4ea5-aff5-ec58fd0dbc23","metadata":{"id":"34e4b65e-69f1-41b0-a79b-c04bbbc6d2c0","s3ObjectName":"pdf/2dce13b8-8bc6-4947-87c7-bdede8026797.pdf/images/4fc69636-3796-400c-9f85-d8d146d4328b.png","pageNumber":23,"bbox":{"x1":524.1499633789062,"x2":524.1499633789062,"y1":524.1499633789062,"y2":524.1499633789062},"type":null,"start":null,"end":null,"question":null,"answer":null,"url":null,"documentChunkId":"dc164b91-a351-4ea5-aff5-ec58fd0dbc23"},"document":{"id":"14bf751b-1458-4a3e-b17f-98d476c14a8a","s3ObjectName":"pdf/2dce13b8-8bc6-4947-87c7-bdede8026797.pdf","originalPath":"/server/ftp-data/dossiers-pédagogiques/astro/2015/2015 - Dinosaures.pdf","publicPath":"","mediaName":"2015 - Dinosaures"},"score":0.35660809654092174}]}
    return <ChunkResults results={xx as ChunkSearchResults} searchWords={searchWords} />;
    // return <ChunkResults results={results as ChunkSearchResults} searchWords={searchWords} />;
    // return groupByDocument.value
    //   ? <DocumentResults results={results as DocumentSearchResults} searchWords={searchWords} />
    //   : <ChunkResults results={results as ChunkSearchResults} searchWords={searchWords} />;
  };

  return (
    <div className="w-full fr-grid-row fr-grid-row--center">
      <div className="fr-col-12 fr-container main-content-item">
        <div className="py-16 flex flex-col gap-8 md:px-0">
          <SearchHeader query={query} />
          <Tabs chunks={(results as ChunkSearchResults)?.chunks || []} />
          {renderSearchResults()}
          <SIPagination pageCount={results?.page_count} />
        </div>
      </div>
    </div>
  );
};

const SearchHeader: React.FC<{ query: string }> = ({ query }) => (
  <div className="flex flex-col items-center text-center px-4 sm:px-0">
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2">
      Résultats de la recherche
    </h1>
    <p className="text-lg sm:text-xl text-black">"{query}"</p>
  </div>
);

const LoadingIndicator: React.FC = () => (
  <div className="h-40 w-full flex items-center justify-center">
    <CircularProgress className="ml-2" />
  </div>
);

const ErrorMessage: React.FC = () => (
  <p>Une erreur s'est produite lors de la recherche.</p>
);

const NoResultsMessage: React.FC = () => (
  <div className="h-40 w-full flex items-center justify-center">
    <p>Aucun résultat trouvé.</p>
  </div>
);

const DocumentResults: React.FC<{ results: DocumentSearchResults, searchWords: string[] }> = ({ results, searchWords }) => (
  <div className="container flex flex-wrap gap-4 overflow-x-clip">
    {results.documents
      .sort((a, b) => b.max_score - a.max_score)
      .map((result) => (
        <DocumentCardWithChunks key={result.document_id} searchResult={result} searchWords={searchWords} />
      ))}
  </div>
);

const ChunkResults: React.FC<{ results: ChunkSearchResults, searchWords: string[] }> = ({ results, searchWords }) => {
  const activeTypes = TabMediaTypeMap[selectedTabType.value] || [];
  return (
    <Masonry columns={ColumnsMediaTypeMap[selectedTabType.value]} spacing={2}>
      {results.chunks
        .sort((a, b) => b.score - a.score)
        .filter(chunk => activeTypes.includes(chunk.media_type as MediaType))
        .map((result, index) => (
          <Item key={index}>
            <ChunkRenderer chunk={result} searchWords={searchWords} />
          </Item>
        ))}
    </Masonry>
  )
};

export default Search;