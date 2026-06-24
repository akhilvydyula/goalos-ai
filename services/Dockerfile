FROM node:20-alpine

ARG SERVICE
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages ./packages
COPY services/${SERVICE} ./services/${SERVICE}

RUN npm install --workspace=@goalos/${SERVICE} --workspace=@goalos/shared --workspace=@goalos/database --include-workspace-root=false 2>/dev/null || \
    npm install

WORKDIR /app/packages/database
RUN npx prisma generate

WORKDIR /app/services/${SERVICE}
EXPOSE 4000
CMD ["npm", "run", "dev"]
