# Use Python 3.9 as the base image
FROM nvidia/cuda:12.0.1-cudnn8-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update
RUN apt-get install -y build-essential
RUN apt install -y software-properties-common

RUN apt-get update && apt-get install -y \
    software-properties-common \
    && add-apt-repository ppa:deadsnakes/ppa \
    && apt-get update \
    && apt-get install -y python3.9 python3.9-distutils

# Install pip for Python 3.9
RUN apt-get install -y curl \
    && curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py \
    && python3.9 get-pip.py \
    && rm get-pip.py

# Clean up to reduce image size
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Set Python 3.9 as the default python version
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.9 1 \
    && update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1

# Set the working directory in the container
WORKDIR /server

# Copy the requirements file into the container
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

EXPOSE 8000

# Run the main.py script
CMD ["python", "app/main.py"]
# CMD ["python", "-m", "http.server", "8000"]