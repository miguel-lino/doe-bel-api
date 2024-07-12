module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            item_usuario: String,
            item_nome_usuario: String,
            // Características da entidade "item", objeto do anúncio
            item_bairro: String,
            item_cidade: String,
            item_descricao: String,
            item_montado: Boolean,
            item_conservacao: String,
            item_retirada: Boolean,
            item_conserto: Boolean,
            item_doado: Boolean,
        },
        { timestamps: true }
    );

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Anuncio = mongoose.model("anuncio", schema);
    return Anuncio;
};
  