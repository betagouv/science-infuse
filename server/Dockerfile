# Use Python 3.9 as the base image
# FROM nvidia/cuda:12.0.1-cudnn8-runtime-ubuntu22.04
# FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime
FROM nvidia/cuda:12.1.0-devel-ubuntu22.04

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update
RUN apt-get install -y build-essential
RUN apt install -y software-properties-common
RUN apt-get install -y git ninja-build 
# cuda-toolkit-12-1

RUN apt-get install -y \
    software-properties-common \
    && add-apt-repository ppa:deadsnakes/ppa \
    && apt-get update \
    && apt-get install -y python3.9 python3.9-distutils

# Install pip for Python 3.9
RUN apt-get install -y curl \
    && curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py \
    && python3.9 get-pip.py \
    && rm get-pip.py

RUN echo "deb http://archive.ubuntu.com/ubuntu/ jammy main restricted universe multiverse" > /etc/apt/sources.list && \
    echo "deb http://archive.ubuntu.com/ubuntu/ jammy-updates main restricted universe multiverse" >> /etc/apt/sources.list && \
    echo "deb http://archive.ubuntu.com/ubuntu/ jammy-backports main restricted universe multiverse" >> /etc/apt/sources.list && \
    echo "deb http://security.ubuntu.com/ubuntu/ jammy-security main restricted universe multiverse" >> /etc/apt/sources.list

# Update package list and install FFmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg

# Clean up to reduce image size
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Set Python 3.9 as the default python version
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.9 1 \
    && update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1



# Set the working directory in the container
WORKDIR /server

ENV PATH /usr/local/cuda/bin:$PATH
ENV LD_LIBRARY_PATH /usr/local/cuda/lib64:$LD_LIBRARY_PATH

# Copy the requirements file into the container

# Install the Python dependencies
RUN apt-get update && apt-get install -y git

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install ninja packaging
RUN pip install -U cffi
RUN pip install torch==2.3.1 torchvision==0.18.1
RUN pip install flash-attn --no-build-isolation --no-cache-dir
# RUN apt install -y tesseract-ocr
# RUN apt install -y tesseract-ocr-fra
RUN playwright install
RUN playwright install-deps

RUN apt install -y poppler-utils
RUN apt-get install -y libcudnn8
RUN apt-get install -y libcudnn8-dev


COPY requirements.txt .

# RUN pip install --no-cache-dir -r requirements.txt
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

EXPOSE 8000

RUN ls -la /server/app

# Run the main.py script
CMD ["python", "app/main.py"]
