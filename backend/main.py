# #file -> runs the FastAPI backend
# from fastapi import FastAPI
# from rag_utils import *
from config import CORS_ORIGINS
# from rag_utils import extract_video_id
# from fastapi.middleware.cors import CORSMiddleware

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# chunks = []
# index = None

# @app.post("/process_video")
# def process_video(url: str):
#     global chunks, index
#     video_id = extract_video_id(url)
#     if not video_id:
#         return {"error": "Invalid YouTube URL"}
    
#     text = get_transcript(video_id)
#     if text is None:
#         return {"error": "Transcript not available for this video"}
    
#     chunks = split_text(text)
#     embeddings = create_embeddings(chunks)
#     index = build_faiss_index(embeddings)
#     return {"message": "Video processed successfully"}

# @app.post("/ask")
# def ask(question: str):
#     if index is None:
#         return {"error": "Please process a video first"}
    
#     try:
#         query_embedding = create_embeddings([question])[0]
#         top_chunks = retrieve_chunks(index, query_embedding)
#         if len(top_chunks) == 0:
#             return {"answer": "No relevant context found in the video."}
        
#         context_chunks = []
#         for i in top_chunks:
#             if i < len(chunks):
#                 context_chunks.append(chunks[i])
#         context = " ".join(context_chunks)
#         print("Retrieved chunks: ", top_chunks)
#         print("Context preview: ", context[:300])
        
#         answer = ask_llm(context, question)
#         return {"answer": answer}
#     except Exception as e:
#         print("Ask error: ", e)
#         return {"error": str(e)}  # ✅ fixed

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from rag_utils import *
from config import CORS_ORIGINS
from rag_utils import (
    extract_video_id,
    extract_requested_timestamp,
    find_chunk_by_timestamp
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chunks = []
timestamps = []
index = None


@app.get("/health")
def health():
    """Simple health-check endpoint for deployment platforms."""
    return {"status": "ok"}


@app.post("/process_video")
def process_video(url: str):
    global chunks, timestamps, index

    video_id = extract_video_id(url)
    if not video_id:
        return {"error": "Invalid YouTube URL"}

    segments = get_transcript(video_id)
    if segments is None:
        return {"error": "Transcript not available for this video"}

    chunks, timestamps = split_text(segments)
    embeddings = create_embeddings(chunks)
    index = build_faiss_index(embeddings)
    return {"message": "Video processed successfully"}

@app.post("/ask")
def ask(question: str):
    if index is None:
        return {"error": "Please process a video first"}

    try:
        requested_seconds = extract_requested_timestamp(question)

        if requested_seconds is not None:
            # Direct timestamp lookup
            best_idx = find_chunk_by_timestamp(timestamps, requested_seconds, chunks)
            context = chunks[best_idx]
            best_timestamp = timestamps[best_idx]
            all_ts = [best_timestamp]
            print("Mode: direct timestamp lookup →", best_timestamp)
        else:
            # Semantic search
            query_embedding = create_embeddings([question])[0]
            top_chunks = retrieve_chunks(index, query_embedding)

            context_chunks = []
            all_ts = []
            for i in top_chunks:
                if i < len(chunks):
                    context_chunks.append(chunks[i])
                    all_ts.append(timestamps[i])

            context = " ".join(context_chunks)
            best_timestamp = all_ts[0] if all_ts else "0:00"
            print("Mode: semantic search → timestamps:", all_ts)

        print("Best timestamp:", best_timestamp)
        print("Context preview:", context[:300])

        answer = ask_llm(context, question, best_timestamp)
        return {
            "answer": answer,
            "timestamp": best_timestamp,
            "all_timestamps": all_ts
        }

    except Exception as e:
        print("Ask error:", e)
        return {"error": str(e)}