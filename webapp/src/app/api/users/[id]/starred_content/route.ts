import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/authOptions';
import { UserFull } from '@/lib/api-client';
import { getUserFull } from '@/lib/utils/db';
import { userIs } from '../../../accessControl';
import { Block, DocumentChunk, UserRoles } from '@prisma/client';
import prisma from '@/lib/prisma';
import { GroupedFavorites } from '@/lib/types';
import { JSONContent } from '@tiptap/core';
import { MetadataType, WebsiteExperienceMetadata } from '@/types/vectordb';



export async function GET(request: NextRequest,
  { params }: { params: { id: string } }
) {

  const session = await getServerSession(authOptions);


  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = params.id == "me" ? session.user.id : params.id;
  const isAdmin = await userIs(session.user.id, [UserRoles.ADMIN])
  try {
    console.log("USER ID", userId, session.user.id)
    if (isAdmin || session.user.id == userId) {




      const userStarredBlocks = await prisma.starredBlock.findMany({
        where: {
          userId,
        },
        select: {
          keyword: true,
          block: {
            include: {
              chapter: true,
            }
          }
        },
      });

      const userStarredDocumentChunks = await prisma.starredDocumentChunk.findMany({
        where: {
          userId,
        },
        select: {
          keyword: true,
          documentChunk: {
            include: {
              document: true,
              metadata: true,
            },
          },
        },
      });

      let response: GroupedFavorites = {};

      userStarredDocumentChunks.forEach(favorite => {
        const { keyword, documentChunk } = favorite;
        if (!response[keyword]) {
          response[keyword] = { documentChunks: [], blocks: [] };
        }
        response[keyword].documentChunks.push({
          ...documentChunk,
          score: 0,
          user_starred: true,
          mediaType: documentChunk.mediaType as any,
          document: {
            ...documentChunk.document,
            documentId: documentChunk.document.id,
            publicPath: documentChunk.document.publicPath || ''
          },
          metadata: documentChunk.metadata as any
        });
      });      
      
      userStarredBlocks.forEach(favorite => {        const { keyword, block } = favorite;
        if (!response[keyword]) {
          response[keyword] = { documentChunks: [], blocks: [] };
        }

        response[keyword].blocks.push({
          ...block,
          user_starred: true,
          score: 0,
          content: block.content as JSONContent[],
          chapter: {
            ...block.chapter,
            educationLevels: [],
            skills: []
          }
        });
      });

      return NextResponse.json(response);
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}