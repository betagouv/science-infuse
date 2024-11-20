FROM docker.io/bitnami/moodle:4.5

# Switch to root to install Node.js
USER root

# Install Node.js, npm and express
RUN apt update && apt install -y nodejs npm && \
    npm install -g express && \
    mkdir -p /opt/node_modules && \
    cd /opt && \
    npm init -y && \
    npm install express

# Copy your Node.js server script
COPY ./server.js /opt
COPY entrypoint.sh /opt/entrypoint.sh
RUN chmod +x /opt/entrypoint.sh

# # Copy and configure the startup script
# COPY start.sh /start.sh

# Switch back to bitnami user for security
# USER 1001

# USER root
# CMD ["/opt/bitnami/scripts/moodle/run.sh"]

ENTRYPOINT [ "/opt/entrypoint.sh" ]
CMD [ "/opt/bitnami/scripts/moodle/run.sh" ]