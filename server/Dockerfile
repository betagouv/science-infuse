# Use Python 3.9 as the base image
FROM nvidia/cuda:12.0.1-cudnn8-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update
RUN apt-get install -y build-essential
RUN apt install -y software-properties-common
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt-get install -y curl
RUN apt-get install -y python3.9
RUN apt-get install -y python3.9-dev
RUN apt-get install -y python3-apt

RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
RUN python3.9 get-pip.py

RUN apt-get install -y git
RUN pip3 install --upgrade pip
RUN pip3 install setuptools
RUN pip3 install appdirs

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