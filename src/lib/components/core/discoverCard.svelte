<script lang="ts">
    interface Props {
        url: string;
        title: string;
        description: string;
        feedSource: string;
        imageUrl: string;
    }

    let {
        url,
        title,
        description,
        feedSource,
        imageUrl
    }: Props = $props()
</script>

<div class="article-card">
    <div class="content">
        <div class="left">
            <a href={url} target="_blank">
                <img src={imageUrl} alt={title}/>
            </a>
        </div>
        <div class="right">
            <a href={url} target="_blank">
                <h3>{title}</h3>
            </a>
            <p class="description">{description}</p>
            <div class="footer">
                <p>By {feedSource}</p>
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    .article-card {
        width: 100%;
        max-width: 800px;
        margin: 20px auto 20px auto;
        padding: 10px;
        border-radius: 10px;
        border: solid #e5e5e5 1px;
        background-color: white;
        transition: 0.3s;
        overflow: hidden;

        .content {
            display: flex;
            align-items: center;

            .left {
                width: 192px;
                height: 100px;
                margin-right: 20px;

                a {
                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        border-radius: 8px;
                    }
                }
            }

            .right {
                width: calc(100% - 120px);

                h3 {
                    font-size: 1.05em;
                    margin: 0;
                    color: #333;
                }

                p.description {
                    font-size: 0.9em;
                    color: #666;
                    margin: 5px 0;
                }

                .footer {
                    text-align: right;
                    margin-top: 12px;
                    font-size: 0.8em;
                    color: #999;
                    overflow: hidden;
                }

            }
        }
    }

    @media (max-width: 500px) {
        /*leftを上に持ってくる*/
        .article-card {
            .content {
                flex-direction: column;

                .left {
                    width: 100%;
                    height: 200px;
                    margin-right: 0;
                }

                .right {
                    width: 100%;
                    margin: 28px 0 0 0;
                    padding: 0 12px 12px 12px;
                }
            }
        }
    }

    @media (max-width: 832px) and (min-width: 501px){
        .article-card {
            .content {
                .right {
                    h3 {
                        width: calc(92vw - 192px - 40px) !important;
                    }
                }
            }
        }
    }

    @media (min-width: 501px) {
        .article-card {
            width: 92vw;

            .content {
                .right {
                    h3 {
                        width: calc(800px - 192px - 40px);
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }
            }
        }
    }

</style>
