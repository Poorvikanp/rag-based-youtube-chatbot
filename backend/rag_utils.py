
# # from youtube_transcript_api import YouTubeTranscriptApi
# # from openai import OpenAI
# # import re
# # import faiss
# # import numpy as np
# # from config import OPENAI_API_KEY, EMBEDDING_MODEL, LLM_MODEL

# # # Initialzing OpenAI Client
# # client = OpenAI(api_key=OPENAI_API_KEY)


# # # 1. Extracting YT Video ID (check & return video id)
# # def extract_video_id(url):
# #     patterns = [
# #         r"(?:v|\/)([0-9A-Za-z_-]{11}).*",
# #         r"youtu\.be\/([0-9A-Za-z_-]{11})"
# #         r"shorts\/([0-9A-Za-z_-]{11})"
# #     ]

# #     for pattern in patterns:
# #         match = re.search(pattern, url)
# #         # if we find a match
# #         if match:
# #             return match.group(1)
# #     return None


# # # 2. Fetching Video Transcript (video id -> full transcript text)
# # def get_transcript(video_id):
# #     try:
# #         ytt_api = YouTubeTranscriptApi()
# #         try:
# #             # fetch english transcript
# #             transcript_data = ytt_api.fetch(video_id, languages=["en"])
# #         except Exception:
# #             transcript_list = ytt_api.list(video_id)
# #             transcript_data = next(iter(transcript_list)).fetch()

# #         full_text = " ".join(item.text for item in transcript_data)
# #         return re.sub(r"\s+", " ", full_text)

# #     except Exception as e:
# #         print("Transcript error: ", e)
# #         return None
    

# # # 3. Splitting Transcript into Chunks (Full transcript -> split it into smaller chunks)
# # def split_text(text, chunk_size=150):
# #     words = text.split()
# #     return [
# #         " ".join(words[i:i + chunk_size])  
# #         for i in range(0, len(words), chunk_size)
# #     ]


# # # 4. Creating Embeddings (create embeddings from chunks: text chunk -> embedding vector)
# # def create_embeddings(text_list):
# #     response = client.embeddings.create(
# #         model=EMBEDDING_MODEL,
# #         input=text_list
# #     )
# #     return np.array([item.embedding for item in response.data]).astype("float32")


# # # 5. Building FAISS Index (store embeddings -> (in) -> Vector -> search)
# # # FAISS - fast similarity search on vectors
# # def build_faiss_index(embeddings):
# #     index = faiss.IndexFlatL2(embeddings.shape[1]) 
# #     index.add(embeddings)       
# #     return index  


# # # 6. Retrieving Relevant Chunks (search: FAISS index -> return: most relevant chunks for a user query)
# # def retrieve_chunks(index, query_embedding, k=3):
# #     distances, indices = index.search(
# #         np.array([query_embedding]).astype("float32"), k
# #     )
# #     return indices[0]


# # # 7. Asking LLM (send: retrieved transcript context & user que -> LLM model)
# # def ask_llm(context, question):
# #     if not context.strip():
# #         return "Sorry, I couldn't find relevant information in the video transcript"
# #     # Truncate context
# #     context = context[:6000]

# #     prompt = f""" You are an AI assistant answering question about a YouTube video. 
# #     The transcript may be in any language (Kannada, Hindi, English, etc).
# #     Always answer in English using the provided context.

# #     Transcript Context:
# #     {context}

# #     Question:
# #     {question}

# #     Answer clearly in English: """

# #     # calling LLM API
# #     response = client.chat.completions.create(
# #         model=LLM_MODEL,
# #         messages=[
# #            {"role": "system", "content": "You answer questions about YouTube videos."},
# #            {"role": "user", "content": prompt}
# #         ]
# #     )
# #     return response.choices[0].message.content



# from youtube_transcript_api import YouTubeTranscriptApi
# from groq import Groq
# from sentence_transformers import SentenceTransformer
# import re
# import faiss
# import numpy as np
# from config import GROQ_API_KEY, EMBEDDING_MODEL, LLM_MODEL

# # Initializing Groq Client
# client = Groq(api_key=GROQ_API_KEY)

# # Initializing local embedding model (downloads once, then cached)
# embedder = SentenceTransformer(EMBEDDING_MODEL)

# # 1. Extracting YT Video ID
# def extract_video_id(url):
#     patterns = [
#         r"(?:v|\/)([0-9A-Za-z_-]{11}).*",
#         r"youtu\.be\/([0-9A-Za-z_-]{11})",
#         r"shorts\/([0-9A-Za-z_-]{11})"
#     ]
#     for pattern in patterns:
#         match = re.search(pattern, url)
#         if match:
#             return match.group(1)
#     return None

# # 2. Fetching Video Transcript
# def get_transcript(video_id):
#     try:
#         ytt_api = YouTubeTranscriptApi()
#         try:
#             transcript_data = ytt_api.fetch(video_id, languages=["en"])
#         except Exception:
#             transcript_list = ytt_api.list(video_id)
#             transcript_data = next(iter(transcript_list)).fetch()
#         full_text = " ".join(item.text for item in transcript_data)
#         return re.sub(r"\s+", " ", full_text)
#     except Exception as e:
#         print("Transcript error: ", e)
#         return None

# # 3. Splitting Transcript into Chunks
# def split_text(text, chunk_size=150):
#     words = text.split()
#     return [
#         " ".join(words[i:i + chunk_size])
#         for i in range(0, len(words), chunk_size)
#     ]

# # 4. Creating Embeddings (now local, no API call)
# def create_embeddings(text_list):
#     embeddings = embedder.encode(text_list, convert_to_numpy=True)
#     return embeddings.astype("float32")

# # 5. Building FAISS Index
# def build_faiss_index(embeddings):
#     index = faiss.IndexFlatL2(embeddings.shape[1])
#     index.add(embeddings)
#     return index

# # 6. Retrieving Relevant Chunks
# def retrieve_chunks(index, query_embedding, k=3):
#     distances, indices = index.search(
#         np.array([query_embedding]).astype("float32"), k
#     )
#     return indices[0]

# # 7. Asking LLM (now using Groq)
# def ask_llm(context, question):
#     if not context.strip():
#         return "Sorry, I couldn't find relevant information in the video transcript"

#     context = context[:6000]
#     prompt = f"""You are an AI assistant answering questions about a YouTube video.
# The transcript may be in any language (Kannada, Hindi, English, etc).
# Always answer in English using the provided context.

# Transcript Context:
# {context}

# Question:
# {question}

# Answer clearly in English:"""

#     response = client.chat.completions.create(
#         model=LLM_MODEL,
#         messages=[
#             {"role": "system", "content": "You answer questions about YouTube videos."},
#             {"role": "user", "content": prompt}
#         ]
#     )
#     return response.choices[0].message.content


from youtube_transcript_api import YouTubeTranscriptApi
from groq import Groq
from sentence_transformers import SentenceTransformer
import re
import faiss
import numpy as np
from config import GROQ_API_KEY, EMBEDDING_MODEL, LLM_MODEL

client = Groq(api_key=GROQ_API_KEY)
embedder = SentenceTransformer(EMBEDDING_MODEL)

# 1. Extract Video ID
def extract_video_id(url):
    patterns = [
        r"(?:v|\/)([0-9A-Za-z_-]{11}).*",
        r"youtu\.be\/([0-9A-Za-z_-]{11})",
        r"shorts\/([0-9A-Za-z_-]{11})"
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

# 2. Fetch Transcript (keeps timestamps)
def get_transcript(video_id):
    try:
        ytt_api = YouTubeTranscriptApi()
        try:
            transcript_data = ytt_api.fetch(video_id, languages=["en"])
        except Exception:
            transcript_list = ytt_api.list(video_id)
            transcript_data = next(iter(transcript_list)).fetch()
        return list(transcript_data)
    except Exception as e:
        print("Transcript error: ", e)
        return None

# 3. Format seconds -> "mm:ss"
def format_timestamp(seconds):
    seconds = int(seconds)
    minutes = seconds // 60
    secs = seconds % 60
    return f"{minutes}:{secs:02d}"

# 4. Split into chunks (preserving timestamps)
def split_text(segments, chunk_size=150):
    chunks = []
    timestamps = []
    words_so_far = []
    current_start = None

    for segment in segments:
        text = segment.text
        start = segment.start

        if current_start is None:
            current_start = start

        words = text.split()
        words_so_far.extend(words)

        if len(words_so_far) >= chunk_size:
            chunks.append(" ".join(words_so_far[:chunk_size]))
            timestamps.append(format_timestamp(current_start))
            words_so_far = words_so_far[chunk_size:]
            current_start = start

    if words_so_far:
        chunks.append(" ".join(words_so_far))
        timestamps.append(format_timestamp(current_start))

    return chunks, timestamps

# 5. Create Embeddings
def create_embeddings(text_list):
    embeddings = embedder.encode(text_list, convert_to_numpy=True)
    return embeddings.astype("float32")

# 6. Build FAISS Index
def build_faiss_index(embeddings):
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)
    return index

# 7. Retrieve Relevant Chunks
def retrieve_chunks(index, query_embedding, k=3):
    distances, indices = index.search(
        np.array([query_embedding]).astype("float32"), k
    )
    return indices[0]

# 8. Convert "mm:ss" -> seconds
def timestamp_to_seconds(ts_str):
    parts = ts_str.strip().split(":")
    if len(parts) == 2:
        return int(parts[0]) * 60 + int(parts[1])
    return None

# 9. Find chunk closest to a requested timestamp
def find_chunk_by_timestamp(timestamps, target_seconds, chunks):
    closest_idx = 0
    min_diff = float("inf")
    for i, ts in enumerate(timestamps):
        secs = timestamp_to_seconds(ts)
        if secs is not None:
            diff = abs(secs - target_seconds)
            if diff < min_diff:
                min_diff = diff
                closest_idx = i
    return closest_idx

# 10. Detect if user is asking about a specific timestamp
def extract_requested_timestamp(question):
    # Match "18:00", "2:35" etc
    match = re.search(r"(\d{1,2}):(\d{2})", question)
    if match:
        minutes = int(match.group(1))
        seconds = int(match.group(2))
        return minutes * 60 + seconds
    # Match "18 mins", "18 minutes"
    match2 = re.search(r"(\d+)\s*min", question, re.IGNORECASE)
    if match2:
        return int(match2.group(1)) * 60
    return None

# 11. Ask LLM
def ask_llm(context, question, timestamp):
    if not context.strip():
        return "Sorry, I couldn't find relevant information in the video transcript"

    context = context[:6000]
    prompt = f"""You are an AI assistant answering questions about a YouTube video.
The transcript may be in any language (Kannada, Hindi, English, etc).
Always answer in English using the provided context.
The relevant content starts at timestamp {timestamp} in the video.

Transcript Context:
{context}

Question:
{question}

Answer clearly in English and mention the timestamp {timestamp} where this is discussed:"""

    response = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": "You answer questions about YouTube videos and always mention the relevant timestamp."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content